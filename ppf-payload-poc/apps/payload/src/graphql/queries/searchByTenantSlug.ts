import { PayloadRequest, TypedLocale, Where } from "payload";
import { GraphQLString } from "graphql/type";
import { COLLECTION_SLUG_SEARCH } from "@/collections/config";
import { QueryResolverConfig } from "./customQueries";
import { getTenantIdBySlug } from "../helpers";

export function searchByTenantSlugResolver({
  GraphQL,
  payload,
  overrideAccess,
}: QueryResolverConfig) {
    return {
        SearchByTenant: {
            type: new GraphQL.GraphQLObjectType({
                ...payload.collections[COLLECTION_SLUG_SEARCH].graphQL!.paginatedType.toConfig(),
                name: "TenantSearch",
            }),
           args: {
                tenantSlug: { type: new GraphQL.GraphQLNonNull(GraphQLString) },
                term: { type: new GraphQL.GraphQLNonNull(GraphQLString) },
                where: {
                    type: payload.collections[COLLECTION_SLUG_SEARCH].graphQL!.whereInputType,
                },
                locale: { type: payload.types.localeInputType },
            },
            resolve: async (
                _: unknown,
                args: { tenantSlug: string; term: string; where: Where; locale?: TypedLocale },
                { req }: { req: PayloadRequest }
            ) => {
                const { tenantSlug, where, locale, term } = args;
                const tenantId = await getTenantIdBySlug(req, overrideAccess, tenantSlug);

                const search = await req.payload.find({
                    collection: COLLECTION_SLUG_SEARCH as any,
                    depth: 0,
                    req,
                    overrideAccess: overrideAccess,
                    where: {
                        ...where,
                        tenant: {
                            equals: tenantId,
                        },
                        or: [
                            {
                                title: {
                                    contains: term
                                },
                            },
                            {
                                content: {
                                    contains: term
                                }
                            }
                        ]
                    },
                    locale,
                });

                return search;
            },
        },
    }
}