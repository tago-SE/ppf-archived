import type { PayloadRequest } from "payload";
import type { PluginOptions, SchemaDefinitions } from "./types";
import { generateV30Spec, generateV31Spec } from "./openapi/generators";

type RequestHandlerArgs = Pick<
  PluginOptions,
  "openapiVersion" | "metadata" | "collectionsFilter"
>;

const loadSchemaDefinitionsFromFile = async () => {
  try {
    const openapiModule = await import("./openapi.json");
    const defaultExport = openapiModule.default;
    const definitions = defaultExport.definitions as SchemaDefinitions;
    return JSON.parse(
      JSON.stringify(definitions, undefined, 2)
    ) as SchemaDefinitions;
  } catch (error) {
    console.error("Error loading schema from file:", error);
    return {};
  }
};

const filterCollections = (
  req: PayloadRequest,
  {
    mode,
    collectionsOrPattern,
  }: Pick<RequestHandlerArgs, "collectionsFilter">["collectionsFilter"]
) => {
  const collections = Object.values(req.payload.collections).filter((x) => {
    const slug = x.config.slug;
    const matches = collectionsOrPattern.some((pattern) =>
      typeof pattern === "string" ? pattern === slug : pattern.test(slug)
    );

    return mode === "exclude" ? !matches : matches;
  });

  return collections;
};

export const createOpenAPIRequestHandler =
  ({ openapiVersion, metadata, collectionsFilter }: RequestHandlerArgs) =>
  async (req: PayloadRequest): Promise<Response> => {
    const definitions = await loadSchemaDefinitionsFromFile();

    const collections = filterCollections(req, collectionsFilter);
    switch (openapiVersion) {
      case "3.0":
        return Response.json(
          await generateV30Spec(req, {
            collections,
            metadata,
            definitions,
          })
        );
      case "3.1":
        return Response.json(
          await generateV31Spec(req, {
            collections,
            metadata,
            definitions,
          })
        );
    }
    throw new Error("Invalid `openapiVersion`");
  };
