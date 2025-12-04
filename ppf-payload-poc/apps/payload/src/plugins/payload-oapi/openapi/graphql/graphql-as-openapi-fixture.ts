import { OpenAPIV3_1 } from "openapi-types";
import { tenantAuthenticationHeaderParameters } from "../headers";

export const graphql_openapi_fixture: Pick<
  OpenAPIV3_1.Document,
  "paths" | "components"
> = {
  paths: {
    "/api/graphql": {
      post: {
        tags: ["GraphQL"],
        summary: "GraphQL Query",
        description:
          "GraphQL integration endpoint with example of how to query the underlying data.",
        operationId: "run-graphql-query",
        parameters: [...tenantAuthenticationHeaderParameters],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["query", "operationName"],
                properties: {
                  query: {
                    type: "string",
                    description: "The GraphQL query string.",
                    example:
                      "query GetAllTenants { Tenants { docs { id slug name } } }",
                  },
                  variables: {
                    type: "object",
                    description: "Variables used in the GraphQL query.",
                    example: {},
                  },
                  operationName: {
                    type: "string",
                    description: "Name of the GraphQL operation.",
                    example: "GetAllTenants",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful GraphQL Request",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/GraphQLSuccess",
                    },
                    errors: {
                      type: "array",
                      description:
                        "List of errors encountered while executing the query.",
                      items: {
                        $ref: "#/components/schemas/GraphQLError",
                      },
                    },
                  },
                  required: [],
                },
              },
            },
          },
          "400": {
            description: "Bad GraphQL Request",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    errors: {
                      type: "array",
                      description:
                        "List of errors encountered while executing the query.",
                      items: {
                        $ref: "#/components/schemas/GraphQLError",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      GraphQLSuccess: {
        type: "object",
        properties: {
          data: {
            type: "object",
            description: "The result of the GraphQL query.",
            example: {
              Tenants: {
                docs: [
                  {
                    id: "561ec947-7247-49c2-8499-d6fa6aef3b64",
                    slug: "tenant-2",
                    name: "Tenant 2",
                  },
                  {
                    id: "a9d92dcc-e8f8-4d70-b011-85929b4ab0f6",
                    slug: "tenant-1",
                    name: "Tenant 1",
                  },
                ],
              },
            },
          },
        },
      },
      GraphQLError: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "You are not allowed to perform this action.",
          },
          locations: {
            type: "array",
            description: "The locations in the query where the error occurred.",
            items: {
              type: "object",
              properties: {
                line: {
                  type: "integer",
                  example: 2,
                },
                column: {
                  type: "integer",
                  example: 3,
                },
              },
            },
            example: [
              {
                line: 2,
                column: 3,
              },
            ],
          },
          path: {
            type: "array",
            description:
              "The path of the GraphQL query where the error occurred.",
            items: {
              type: "string",
            },
            example: ["Tenants"],
          },
          extensions: {
            type: "object",
            description: "Additional error metadata.",
            properties: {
              name: {
                type: "string",
                example: "y",
              },
              statusCode: {
                type: "integer",
                example: 403,
              },
            },
            example: [{ name: "y", statusCode: 403 }],
          },
        },
      },
    },
  },
};
