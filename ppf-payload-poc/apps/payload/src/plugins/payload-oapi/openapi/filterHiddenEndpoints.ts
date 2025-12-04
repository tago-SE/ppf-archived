import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {
  CustomCollectionOpenApiConfiguration,
  openApiCollectionConfigKeyName,
  OpenApiMethodOptions,
} from "../types";
import type { Collection } from "payload";

const getCollectionOpenApiConfig = (collection: Collection) => {
  const collectionOpenApiConfig = collection.config
    .custom as CustomCollectionOpenApiConfiguration;
  if (
    collectionOpenApiConfig &&
    openApiCollectionConfigKeyName in collectionOpenApiConfig
  ) {
    const updatedPaths = Object.fromEntries(
      Object.entries(collectionOpenApiConfig.openapi.paths).map(
        ([path, methods]) => [
          path.replace("{slug}", collection.config.slug),
          methods,
        ]
      )
    );
    return {
      ...collectionOpenApiConfig.openapi,
      paths: updatedPaths,
    };
  }
  return undefined;
};

export const filterHiddenEndpoints = (
  apiSchema: Record<
    string,
    OpenAPIV3.PathItemObject & OpenAPIV3_1.PathItemObject
  >,
  collection: Collection
) => {
  const openApiConfig = getCollectionOpenApiConfig(collection);
  if (!openApiConfig) {
    return apiSchema;
  }
  for (const [path, methods] of Object.entries(apiSchema)) {
    for (const [method, operation] of Object.entries(methods)) {
      const pathConfig = openApiConfig.paths[path];
      if (!!pathConfig) {
        const methodConfig = (pathConfig as any)[
          method
        ] as OpenApiMethodOptions;
        if (!!methodConfig && !!methodConfig.hidden) {
          delete (methods as any)[method];
        }
      }
    }
    if (Object.keys(methods).length === 0) {
      delete apiSchema[path];
    }
  }
  return apiSchema;
};
