import { OpenAPIV3_1 } from "openapi-types";
import { graphql_openapi_fixture as gqlspec } from "./graphql-as-openapi-fixture";

/**
 * This was a simple way to expose the GraphQL endpoint to the If-Api-Platform.
 *
 * NOTE: It does not handle complex scenarios where custom resolvers so it is quite limited in showing how the actual portal user is intended to use it.
 */
export const appendGraphQLEndpoint = (schema: OpenAPIV3_1.Document) => {
  const updatedSchema = {
    ...schema,
    paths: { ...schema.paths, ...gqlspec.paths },
    components: {
      ...schema.components,
      schemas: {
        ...schema.components?.schemas,
        ...gqlspec.components?.schemas,
      },
    },
  } satisfies OpenAPIV3_1.Document;
  return updatedSchema;
};
