import _jsonSchemaToOpenapiSchema from "@openapi-contrib/json-schema-to-openapi-schema";
import type { JSONSchema4 } from "json-schema";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import type {
  Collection,
  CollectionSlug,
  Field,
  FieldBase,
  PayloadRequest,
  RadioField,
  SanitizedConfig,
  SanitizedGlobalConfig,
  SelectField,
} from "payload";
import { entityToJSONSchema } from "payload";
import type { GeneratorArgs, SchemaDefinitions } from "../types";
import { mapValuesAsync } from "../utils/objects";
import {
  type ComponentType,
  collectionName,
  componentName,
  globalName,
} from "./naming";
import { tenantAuthenticationHeaderParameters } from "./headers";
import { isOpenToPublic } from "./isOpenToPublic";
import { filterHiddenEndpoints } from "./filterHiddenEndpoints";
import { appendGraphQLEndpoint } from "./graphql/generate-gql";

const baseQueryParams: Array<
  OpenAPIV3.ParameterObject & OpenAPIV3_1.ParameterObject
> = [
  { in: "query", name: "depth", schema: { type: "number" } },
  { in: "query", name: "locale", schema: { type: "string" } },
  { in: "query", name: "fallback-locale", schema: { type: "string" } },
];

async function jsonSchemaToOpenapiSchema(
  schema: JSONSchema4
): Promise<OpenAPIV3.Document> {
  return await (_jsonSchemaToOpenapiSchema as any)(schema);
}

const adjustRefTargets = (
  req: PayloadRequest,
  subject: Record<string, unknown>,
  componentsSchemas: Record<string, JSONSchema4>
) => {
  const search = /^#\/definitions\/(.*)/;
  const failedDefinitions = new Set<string>();

  for (const [key, value] of Object.entries(subject)) {
    //
    if (key === "$ref" && typeof value === "string") {
      subject[key] = value.replace(search, (_match, name: string) => {
        const collection = req.payload.collections[name as CollectionSlug] as
          | Collection
          | undefined;

        if (!!collection) {
          name = collectionName(collection).singular;
        } else {
          const global = req.payload.globals.config.find(
            ({ slug }) => slug === name
          );
          if (!!global) {
            name = globalName(global);
          } else {
            //
            const component = componentsSchemas[name];
            if (!component) {
              console.debug(`Failed to find reference: ${name}`);
              failedDefinitions.add(value);
            } else {
              // Found component in the componentsSchemas
              // Maybe the return here is breaking the tenant properties where
              return `#/components/schemas/${componentName("schemas", name)}`;
            }
            //
          }
        }
        return `#/components/schemas/${componentName("schemas", name)}`;
      });
    }
    if (typeof value === "object" && value !== null) {
      const { failedDefinitions: childFailed } = adjustRefTargets(
        req,
        value as Record<string, unknown>,
        componentsSchemas
      );
      for (let item of childFailed) {
        failedDefinitions.add(item);
      }
    }
  }
  return { failedDefinitions: Array.from(failedDefinitions) };
};

const composeRef = (
  type: ComponentType,
  name: string,
  options?: { suffix?: string; prefix?: string }
): OpenAPIV3_1.ReferenceObject & OpenAPIV3.ReferenceObject => ({
  $ref: `#/components/${type}/${componentName(type, name, options)}`,
});

const generateSchemaObject = (
  config: SanitizedConfig,
  collection: Collection
): JSONSchema4 => {
  const schema = entityToJSONSchema(
    config,
    collection.config,
    new Map(),
    "text",
    undefined
  );
  return {
    ...schema,
    title: collectionName(collection).singular,
  };
};

const requestBodySchema = (
  fields: Array<Field>,
  schema: JSONSchema4
): JSONSchema4 => ({
  ...schema,
  properties: Object.fromEntries(
    Object.entries(schema.properties ?? {})
      .filter(([slug]) => !["id", "createdAt", "updatedAt"].includes(slug))
      .map(([fieldName, schema]) => {
        const field = fields.find((field) => {
          return (field as FieldBase).name === fieldName;
        });
        if (field?.type === "relationship") {
          const target = Array.isArray(field.relationTo)
            ? field.relationTo
            : [field.relationTo];
          return [
            fieldName,
            { type: "string", description: `ID of the ${target.join("/")}` },
          ];
        }
        return [fieldName, schema];
      })
  ),
});

const generateRequestBodySchema = (
  config: SanitizedConfig,
  collection: Collection
): OpenAPIV3_1.RequestBodyObject => {
  const schema = entityToJSONSchema(
    config,
    collection.config,
    new Map(),
    "text",
    undefined
  );
  return {
    description: collectionName(collection).singular,
    content: {
      "application/json": {
        schema: requestBodySchema(
          collection.config.fields,
          schema
        ) as OpenAPIV3_1.SchemaObject,
      },
    },
  };
};

const generateQueryOperationSchemas = (
  collection: Collection
): Record<string, JSONSchema4> => {
  const { singular } = collectionName(collection);

  return {
    [componentName("schemas", singular, { suffix: "QueryOperations" })]: {
      title: `${singular} query operations`,
      type: "object",
      properties: Object.fromEntries(
        (
          collection.config.fields.filter(({ type }) =>
            [
              "number",
              "text",
              "email",
              "date",
              "radio",
              "checkbox",
              "select",
            ].includes(type)
          ) as Array<
            FieldBase & {
              type:
                | "number"
                | "text"
                | "email"
                | "date"
                | "radio"
                | "select"
                | "checkbox";
            }
          >
        ).map((field) => {
          const comparedValueSchema = (() => {
            switch (field.type) {
              case "number":
                return { type: "number" } as const;
              case "text":
                return { type: "string" } as const;
              case "email":
                return { type: "string", format: "email" } as const;
              case "date":
                return { type: "string", format: "date-time" } as const;
              case "checkbox":
                return { type: "boolean" } as const;
              case "radio":
              case "select":
                return {
                  type: "string",
                  enum: (field as RadioField | SelectField).options.map((it) =>
                    typeof it === "string" ? it : it.value
                  ),
                } as const;
            }
          })();

          const properties: Record<string, JSONSchema4> = {
            ["equals"]: comparedValueSchema,
            ["not_equals"]: comparedValueSchema,
            ["in"]: { type: "string" },
            ["not_in"]: { type: "string" },
          };

          if (field.type === "text") {
            properties["like"] = comparedValueSchema;
          }

          if (field.type === "text" || field.type === "email") {
            properties["contains"] = comparedValueSchema;
          }

          if (field.type === "number" || field.type === "date") {
            properties["greater_than"] = comparedValueSchema;
            properties["greater_than_equal"] = comparedValueSchema;
            properties["less_than"] = comparedValueSchema;
            properties["less_than_equal"] = comparedValueSchema;
          }

          return [
            field.name,
            {
              type: "object",
              properties,
            },
          ];
        })
      ),
    },
    [componentName("schemas", singular, { suffix: "QueryOperationsAnd" })]: {
      title: `${singular} query conjunction`,
      type: "object",
      properties: {
        and: {
          type: "array",
          items: {
            anyOf: [
              composeRef("schemas", singular, { suffix: "QueryOperations" }),
              composeRef("schemas", singular, { suffix: "QueryOperationsAnd" }),
              composeRef("schemas", singular, { suffix: "QueryOperationsOr" }),
            ],
          },
        },
      },
      required: ["and"],
    },

    [componentName("schemas", singular, { suffix: "QueryOperationsOr" })]: {
      title: `${singular} query disjunction`,
      type: "object",
      properties: {
        or: {
          type: "array",
          items: {
            anyOf: [
              composeRef("schemas", singular, { suffix: "QueryOperations" }),
              composeRef("schemas", singular, { suffix: "QueryOperationsAnd" }),
              composeRef("schemas", singular, { suffix: "QueryOperationsOr" }),
            ],
          },
        },
      },
      required: ["or"],
    },
  };
};

const generateCollectionResponses = (
  collection: Collection
): Record<string, OpenAPIV3_1.ResponseObject & OpenAPIV3.ResponseObject> => {
  const { singular, plural } = collectionName(collection);

  return {
    [componentName("responses", singular)]: {
      description: `${singular} object`,
      content: {
        "application/json": {
          schema: composeRef("schemas", singular),
        },
      },
    },
    [componentName("responses", singular, { prefix: "New" })]: {
      description: `${singular} object`,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              doc: {
                allOf: [
                  composeRef("schemas", singular),
                  {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                      },
                      updatedAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                    required: ["id", "createdAt", "updatedAt"],
                  },
                ],
              },
            },
            required: ["message", "doc"],
          },
        },
      },
    },
    [componentName("responses", singular, { suffix: "NotFound" })]: {
      description: `${singular} not found`,
    },
    [componentName("responses", singular, { suffix: "List" })]: {
      description: `List of ${plural}`,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              docs: {
                type: "array",
                items: composeRef("schemas", singular),
              },
              totalDocs: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
              page: { type: "integer" },
              pagingCounter: { type: "integer" },
              hasPrevPage: { type: "boolean" },
              hasNextPage: { type: "boolean" },
              prevPage: { type: ["integer", "null"] },
              nextPage: { type: ["integer", "null"] },
            },
            required: [
              "docs",
              "totalDocs",
              "limit",
              "totalPages",
              "page",
              "pagingCounter",
              "hasPrevPage",
              "hasNextPage",
              "prevPage",
              "nextPage",
            ],
          } as OpenAPIV3_1.NonArraySchemaObject as any,
        },
      },
    },
  };
};

const generateCollectionOperationsAsync = async (
  collection: Collection
): Promise<
  Record<string, OpenAPIV3.PathItemObject & OpenAPIV3_1.PathItemObject>
> => {
  const { slug } = collection.config;
  const { singular, plural } = collectionName(collection);
  const tags = [plural];

  const singleObjectResponses = {
    200: composeRef("responses", singular),
    404: composeRef("responses", singular, { suffix: "NotFound" }),
  } satisfies OpenAPIV3_1.ResponsesObject & OpenAPIV3.ResponsesObject;

  const [publicRead, publicCreate, publicUpdate] = await Promise.all([
    isOpenToPublic(collection.config.access.read),
    isOpenToPublic(collection.config.access.create),
    isOpenToPublic(collection.config.access.update),
  ]);

  const collectionApiSchema: Record<
    string,
    OpenAPIV3.PathItemObject & OpenAPIV3_1.PathItemObject
  > = {
    [`/api/${slug}`]: {
      get: {
        summary: `Retrieve a list of ${plural}`,
        tags,
        parameters: [
          { in: "query", name: "page", schema: { type: "number" } },
          { in: "query", name: "limit", schema: { type: "number" } },
          ...baseQueryParams,
          ...(publicRead ? [] : tenantAuthenticationHeaderParameters),
          {
            in: "query",
            name: "sort",
            schema: {
              type: "string",
              enum: collection.config.fields.flatMap((field) => {
                if (
                  field.type === "number" ||
                  field.type === "text" ||
                  field.type === "email" ||
                  field.type === "date"
                ) {
                  return [field.name, `-${field.name}`];
                }
                return [];
              }),
            },
          },
          {
            in: "query",
            name: "where",
            style: "deepObject",
            schema: {
              allOf: [
                { type: "object" },
                {
                  anyOf: [
                    composeRef("schemas", singular, {
                      suffix: "QueryOperations",
                    }),
                    composeRef("schemas", singular, {
                      suffix: "QueryOperationsAnd",
                    }),
                    composeRef("schemas", singular, {
                      suffix: "QueryOperationsOr",
                    }),
                  ],
                },
              ],
            },
          },
        ],
        responses: {
          200: composeRef("responses", singular, { suffix: "List" }),
        },
      },
      post: {
        summary: `Create a new ${singular}`,
        tags,
        parameters: [
          ...(publicCreate ? [] : tenantAuthenticationHeaderParameters),
        ],

        requestBody: composeRef("requestBodies", singular),
        responses: {
          201: composeRef("responses", singular, { prefix: "New" }),
        },
      },
    },
    [`/api/${slug}/{id}`]: {
      parameters: [
        ...baseQueryParams,
        {
          in: "path",
          name: "id",
          description: `ID of the ${singular}`,
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      get: {
        summary: `Find a ${singular} by ID`,
        tags,
        parameters: [
          ...(publicRead ? [] : tenantAuthenticationHeaderParameters),
        ],
        responses: singleObjectResponses,
      },
      patch: {
        summary: `Update a ${singular}`,
        tags,
        parameters: [
          ...(publicUpdate ? [] : tenantAuthenticationHeaderParameters),
        ],
        responses: singleObjectResponses,
      },
      delete: {
        summary: `Delete a ${singular}`,
        tags,
        parameters: [
          ...(publicCreate ? [] : tenantAuthenticationHeaderParameters),
        ],
        responses: singleObjectResponses,
      },
    },
  };
  return filterHiddenEndpoints(collectionApiSchema, collection);
};

const generateGlobalResponse = (
  global: SanitizedGlobalConfig
): OpenAPIV3_1.ResponseObject & OpenAPIV3.ResponseObject => {
  const name = globalName(global);

  return {
    description: name,
    content: {
      "application/json": {
        schema: composeRef("schemas", name, { suffix: "Read" }),
      },
    },
  };
};

const generateGlobalRequestBody = (
  global: SanitizedGlobalConfig
): OpenAPIV3_1.RequestBodyObject & OpenAPIV3.RequestBodyObject => {
  const name = globalName(global);

  return {
    description: name,
    content: {
      "application/json": {
        schema: composeRef("schemas", name, { suffix: "Write" }),
      },
    },
  };
};

const generateGlobalSchemas = (
  config: SanitizedConfig,
  global: SanitizedGlobalConfig
): Record<string, JSONSchema4> => {
  const schema = entityToJSONSchema(
    config,
    global,
    new Map(),
    "text",
    undefined
  );

  return {
    [componentName("schemas", globalName(global))]: {
      ...schema,
      title: globalName(global),
    },
    [componentName("schemas", globalName(global), { suffix: "Read" })]: {
      title: `${globalName(global)} (if present)`,
      oneOf: [schema, { type: "object", properties: {} }],
    },
    [componentName("schemas", globalName(global), { suffix: "Write" })]: {
      ...requestBodySchema(global.fields, schema),
      title: `${globalName(global)} (writable fields)`,
    },
  };
};

const generateGlobalOperations = (
  global: SanitizedGlobalConfig
): Record<string, OpenAPIV3.PathItemObject & OpenAPIV3_1.PathItemObject> => {
  const slug = global.slug;
  const singular = globalName(global);
  const tags = [singular];

  return {
    [`/api/globals/${slug}`]: {
      get: {
        summary: `Get the ${singular}`,
        tags,
        parameters: [
          ...baseQueryParams,
          ...tenantAuthenticationHeaderParameters,
        ],
        responses: { 200: composeRef("responses", singular) },
        // security: (await isOpenToPublic(global.access.read))
        //   ? []
        //   : [apiKeySecurity],
      },
      post: {
        summary: `Update the ${singular}`,
        tags,
        requestBody: composeRef("requestBodies", singular),
        parameters: [...tenantAuthenticationHeaderParameters],
        responses: { 200: composeRef("responses", singular) },
        // security: (await isOpenToPublic(global.access.read))
        //   ? []
        //   : [apiKeySecurity],
      },
    },
  };
};

const generateComponents = (req: PayloadRequest, collections: Collection[]) => {
  const schemas: Record<string, JSONSchema4> = {};

  for (const collection of collections) {
    const { singular } = collectionName(collection);
    schemas[componentName("schemas", singular)] = generateSchemaObject(
      req.payload.config,
      collection
    );
  }

  for (const collection of collections) {
    Object.assign(schemas, generateQueryOperationSchemas(collection));
  }

  for (const global of req.payload.globals.config) {
    Object.assign(schemas, generateGlobalSchemas(req.payload.config, global));
  }

  const requestBodies: Record<string, OpenAPIV3_1.RequestBodyObject> = {};

  for (const collection of collections) {
    const { singular } = collectionName(collection);
    requestBodies[componentName("requestBodies", singular)] =
      generateRequestBodySchema(req.payload.config, collection);
  }

  for (const global of req.payload.globals.config) {
    requestBodies[componentName("requestBodies", globalName(global))] =
      generateGlobalRequestBody(global);
  }

  const responses: Record<string, OpenAPIV3_1.ResponseObject> = Object.assign(
    {},
    ...collections.map(generateCollectionResponses),
    ...req.payload.globals.config.map((global) => ({
      [componentName("responses", globalName(global))]:
        generateGlobalResponse(global),
    }))
  );

  return { schemas, requestBodies, responses };
};

const filteredDefinitions = (
  definitionNames: string[],
  schema: Record<string, JSONSchema4>
) => {
  const matchedDefinitions = Object.keys(schema)
    .filter((key) => definitionNames.includes(key))
    .reduce((acc, key) => {
      const definition = schema[key];
      if (!definition.title) {
        definition.title = key;
      }
      acc[key] = definition;
      return acc;
    }, {} as Record<string, JSONSchema4>);
  return matchedDefinitions;
};

const tryResolveComponentSchemas = async (
  req: PayloadRequest,
  componentSchemas: Record<string, JSONSchema4>,
  definitions: SchemaDefinitions
) => {
  let combinedSchema = componentSchemas;
  let failedNames: string[] = [];
  let attempts = 0;
  while (attempts < 3) {
    const { failedDefinitions } = adjustRefTargets(
      req,
      { components: { schemas: combinedSchema } },
      combinedSchema
    );
    failedNames = failedDefinitions.map((definition: string) =>
      definition.replace("#/definitions/", "")
    );
    if (failedNames.length === 0) {
      break;
    }
    const newSchemas = filteredDefinitions(failedNames, definitions);
    console.log("Adding ts-file definitions", Object.keys(newSchemas));
    combinedSchema = { ...combinedSchema, ...newSchemas };
    attempts++;
  }
  return { combinedSchema, failedNames };
};

export const generateV30Spec = async (
  req: PayloadRequest,
  { metadata, definitions = {}, collections }: GeneratorArgs
): Promise<OpenAPIV3.Document> => {
  const {
    schemas: initialSchema,
    requestBodies,
    responses,
  } = generateComponents(req, collections);

  const { combinedSchema, failedNames } = await tryResolveComponentSchemas(
    req,
    initialSchema,
    definitions
  );

  if (failedNames.length > 0) {
    throw new Error("Failed to resolve all Names");
  }

  const openApiSchemas = await mapValuesAsync(
    jsonSchemaToOpenapiSchema,
    combinedSchema
  );

  const paths = Object.assign(
    {},
    ...(await Promise.all(collections.map(generateCollectionOperationsAsync))),
    ...req.payload.globals.config.map(generateGlobalOperations)
  );

  const spec = {
    openapi: "3.0.3",
    info: metadata,
    servers: [{ url: `${req.protocol}//${req.headers.get("host")}` }],
    paths: paths,
    components: {
      schemas: openApiSchemas,
      requestBodies: await mapValuesAsync(
        async (requestBody) => ({
          ...requestBody,
          content: (await mapValuesAsync(
            async (contentItem) => ({
              ...contentItem,
              schema: contentItem.schema
                ? await jsonSchemaToOpenapiSchema(
                    contentItem.schema as JSONSchema4
                  )
                : undefined,
            }),
            requestBody.content
          )) as Record<string, OpenAPIV3.MediaTypeObject>,
        }),
        requestBodies
      ),
      responses: await mapValuesAsync(async (response) => {
        return {
          ...response,
          content:
            response.content !== undefined
              ? ((await mapValuesAsync(
                  async (contentItem) => ({
                    ...contentItem,
                    schema: contentItem.schema
                      ? await jsonSchemaToOpenapiSchema(
                          contentItem.schema as JSONSchema4
                        )
                      : undefined,
                  }),
                  response.content
                )) as Record<string, OpenAPIV3.MediaTypeObject>)
              : {},
        };
      }, responses),
    },
  } satisfies OpenAPIV3.Document;
  adjustRefTargets(req, spec, spec.components.schemas);
  return appendGraphQLEndpoint(spec) as OpenAPIV3.Document;
};

// Currently not used
export const generateV31Spec = async (
  req: PayloadRequest,
  { metadata, definitions = {}, collections }: GeneratorArgs
): Promise<OpenAPIV3_1.Document> => {
  const { schemas, requestBodies, responses } = generateComponents(
    req,
    collections
  );

  const spec = {
    openapi: "3.1.0",
    info: metadata,
    servers: [{ url: `${req.protocol}//${req.headers.get("host")}` }],
    paths: Object.assign(
      {},
      ...(await Promise.all(
        collections.map(generateCollectionOperationsAsync)
      )),
      ...req.payload.globals.config.map(generateGlobalOperations)
    ),
    components: {
      schemas: schemas as Record<string, OpenAPIV3_1.SchemaObject>,
      requestBodies,
      responses,
    },
  } satisfies OpenAPIV3_1.Document;

  adjustRefTargets(req, spec, schemas);
  return appendGraphQLEndpoint(spec);
};
