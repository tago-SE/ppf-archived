import { CollectionSlug, PayloadRequest } from "payload";
import { GraphQLBoolean, GraphQLString } from "graphql/type";
import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";
import { QueryResolverConfig } from "./customQueries";
import { buildPaginatedListType } from "@payloadcms/graphql/types";
import { getTenantIdBySlug } from "../helpers";
import _ from "lodash";

const collectionList = [COLLECTION_SLUG_DYANMIC_PAGE];

export function sitemapBySlugResolver({
  GraphQL,
  payload,
  overrideAccess,
}: QueryResolverConfig) {
  return {
    SitemapByTenant: {
      type: buildPaginatedListType(
        'TenantSitemap',
        new GraphQL.GraphQLObjectType({
          name: 'Sitemap',
          fields: {
            id: {
              type: GraphQL.GraphQLString
            },
            slug: {
              type: GraphQL.GraphQLString
            },
            collection: {
              type: GraphQL.GraphQLString
            },
            pageTemplate: {
              type: payload.collections[
                COLLECTION_SLUG_DYANMIC_PAGE
              ].graphQL!.type.toConfig().fields['pageTemplate'].type
            }
          }
        })
      ),
      args: {
        tenantSlug: {
          type: new GraphQL.GraphQLNonNull(GraphQLString),
        },
        draftMode: {
          type: new GraphQL.GraphQLNonNull(GraphQLBoolean)
        }
      },
      resolve: async (
        _: any,
        args: { tenantSlug: string, draftMode?: boolean },
        { req }: { req: PayloadRequest }
      ) => {
        const { tenantSlug, draftMode } = args;
        const tenantId = await getTenantIdBySlug(req, overrideAccess, tenantSlug);
        const result = await Promise.all(collectionList.map(async x => {
          return {
            collection: x,
            result: await req.payload.find({
              collection: x as CollectionSlug,
              depth: 0,
              req,
              overrideAccess: overrideAccess,
              where: {
                tenant: {
                  equals: tenantId,
                },
                ...(draftMode ? {} : {
                  _status: {
                    equals: 'published'
                  }
                })
              },
              select: {
                slug: true,
                pageTemplate: true
              }
            })
          }
        }));

        return {
          docs: result.flatMap(x => x.result.docs.map(y => {
            const { id, slug, pageTemplate } = y as { id: string, slug: string, pageTemplate?: string }
            return {
              id,
              slug,
              collection: x.collection,
              pageTemplate: pageTemplate
            }
          }))
        };
      },
    },
  };
}
