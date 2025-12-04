import type { JSONSchema4 } from "json-schema";
import type { Collection } from "payload";

export type OpenAPIVersion = "3.0" | "3.1";

export interface OpenAPIMetadata {
  title: string;
  version: string;
  description?: string;
}

/**
 * Example { collectionNameOrRegex: ["users"], mode: "include"}
 */
type CollectionFilterOptions = {
  /**
   * Name of collection or Regex
   */
  collectionsOrPattern: (string | RegExp)[];
  /**
   * If the filter should include or exclude on match
   */
  mode: "include" | "exclude";
};

export interface PluginOptions {
  enabled?: boolean;
  openapiVersion?: OpenAPIVersion;
  specEndpoint?: string;
  metadata: OpenAPIMetadata;
  collectionsFilter: CollectionFilterOptions;
}

export type SchemaDefinitions = {
  [x: string]: JSONSchema4;
};

export type GeneratorArgs = {
  definitions: SchemaDefinitions;
  collections: Collection[];
} & Pick<PluginOptions, "metadata">;

export type OpenApiMethodOptions = {
  hidden?: boolean;
};

type OpenApiCollectionPathsConfig = {
  "/api/{slug}"?: {
    get?: OpenApiMethodOptions;
    post?: OpenApiMethodOptions;
  };
  "/api/{slug}/{id}"?: {
    get?: OpenApiMethodOptions;
    patch?: OpenApiMethodOptions;
    delete?: OpenApiMethodOptions;
  };
};

export const openApiCollectionConfigKeyName = "openapi";

export type CustomCollectionOpenApiConfiguration = {
  [openApiCollectionConfigKeyName]: {
    paths: OpenApiCollectionPathsConfig;
  };
};
