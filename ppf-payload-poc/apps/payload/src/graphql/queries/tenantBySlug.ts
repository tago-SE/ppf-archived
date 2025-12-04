import { PayloadRequest } from "payload";
import { GraphQLString } from "graphql/type";
import { COLLECTION_SLUG_TENANTS } from "@/collections/config";
import { QueryResolverConfig } from "./customQueries";

export function tenantBySlugResolver({
  GraphQL,
  payload,
  overrideAccess,
}: QueryResolverConfig) {
  return {
    TenantBySlug: {
      type: payload.collections[COLLECTION_SLUG_TENANTS].graphQL!.type,
      args: {
        slug: {
          type: new GraphQL.GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _: any,
        args: { slug: string },
        { req }: { req: PayloadRequest }
      ) => {
        const { slug } = args;
        const tenant = await req.payload.find({
          collection: COLLECTION_SLUG_TENANTS,
          depth: 0,
          req,
          overrideAccess: overrideAccess,
          where: {
            slug: {
              equals: slug,
            },
          },
        });
        return tenant.docs[0];
      },
    },
  };
}
