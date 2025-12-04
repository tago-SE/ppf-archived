import { CollectionSlug, GraphQLInfo, SanitizedConfig } from "payload";
import { GraphQL as GraphQLPayload } from "@payloadcms/graphql/types";
import { tenantBySlugResolver } from "./tenantBySlug";
import { strToBoolean } from "@/lib/utils/strToBoolean";
import { searchByTenantSlugResolver } from "./searchByTenantSlug";
import { pageTypes } from "@/collections/Pages/pageTemplate";
import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";
import { generateCollectionResolverByTenant, generatePageResolverByTenant, getPageBaseInterface } from "./resolverGenerators";
import { sitemapBySlugResolver } from "./siteMapByTenant";

export type QueryResolverConfig = {
  GraphQL: typeof GraphQLPayload;
  payload: {
    config: SanitizedConfig;
  } & GraphQLInfo;
  overrideAccess: boolean;
};

/**
 * By default GraphQL security is enabled. Set to false to override access making the resolvers publically available.
 */
const enableGraphQLSecurity =
  strToBoolean(process.env.GRAPHQL_SECURE_RESOLVERS) ?? true;

export function customResolvers(
  GraphQL: typeof GraphQLPayload,
  payload: {
    config: SanitizedConfig;
  } & GraphQLInfo
) {
  const config: QueryResolverConfig = {
    GraphQL,
    payload,
    overrideAccess: !enableGraphQLSecurity,
  };

  const base = getPageBaseInterface(config);
  //addInterfaceToPage(config, base)

  return {
    ...tenantBySlugResolver(config),
    ...searchByTenantSlugResolver(config),
    ...sitemapBySlugResolver(config),

    // NOTE: This code is commented out and just left as an example on how to generate ByTenant resolvers for collections
    // Generate Collection By Tenant Resolvers
    /*...[
      COLLECTION_SLUG_PAGES,
      COLLECTION_SLUG_POSTS,
    ].map(x => generateCollectionResolverByTenant(config, x as CollectionSlug))
     .reduce((acc, item) => { return { ...acc, ...item }; }, {}),
    */

    ...[
     COLLECTION_SLUG_DYANMIC_PAGE,
    ].map(x => generateCollectionResolverByTenant(config, x as CollectionSlug, [base]))
     .reduce((acc, item) => { return { ...acc, ...item }; }, {}),

    // Generate Dynamic Page (page template specific) By Tenant Resolvers
    ...pageTypes
      .map(x => generatePageResolverByTenant(config, base, x.name))
      .reduce((acc, item) => { return { ...acc, ...item }; }, {})
  };
}

