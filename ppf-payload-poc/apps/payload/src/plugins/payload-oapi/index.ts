import {
  COLLECTION_SLUG_CATEGORIES,
  COLLECTION_SLUG_DYANMIC_PAGE,
  COLLECTION_SLUG_MEDIA,
  COLLECTION_SLUG_REUSABLE_BLOCKS,
  COLLECTION_SLUG_SEARCH,
  COLLECTION_SLUG_TENANTS,
  COLLECTION_SLUG_USERS,
} from "@/collections/config";
import openapi from "./openapiPlugin";
import rapidoc from "./rapidocPlugin";
import redoc from "./redocPlugin";
import swaggerUI from "./swaggerUIPlugin";
import { strToBoolean } from "@/lib/utils/strToBoolean";

export { openapi, swaggerUI, rapidoc, redoc };

const enabled = strToBoolean(process.env.NEXT_PUBLIC_OPENAPI_ENABLED) ?? false;

const specEndpoint = "/openapi.json";
export const apiDocsPlugins = [
  openapi({
    openapiVersion: "3.0",
    metadata: {
      title: "Dev API",
      version: "0.0.1",
      description: "API documentation for the Dev API",
    },
    specEndpoint: specEndpoint,
    enabled: enabled,
    collectionsFilter: {
      mode: "include",
      collectionsOrPattern: [
        COLLECTION_SLUG_USERS,
        COLLECTION_SLUG_TENANTS,
        COLLECTION_SLUG_CATEGORIES,
        COLLECTION_SLUG_MEDIA,
        COLLECTION_SLUG_SEARCH,
        COLLECTION_SLUG_DYANMIC_PAGE,
        COLLECTION_SLUG_REUSABLE_BLOCKS,
      ],
    },
  }),
  swaggerUI({
    enabled: enabled,
    specEndpoint: specEndpoint,
    docsUrl: "/swagger-ui",
  }),
  rapidoc({
    enabled: false,
    specEndpoint: specEndpoint,
    docsUrl: "rapidoc",
  }),
  redoc({
    enabled: false,
    specEndpoint: specEndpoint,
    docsUrl: "redocs",
  }),
];
