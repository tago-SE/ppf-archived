import { COLLECTION_SLUG_TENANTS } from "@/collections/config";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import { PayloadRequest } from "payload";

// This is custom GraphQL resolver witch allows to fetch tenant data by it's slug. Default resolver allows to fetch tenant by it's ID
export const getTenantIdBySlug = async (req: PayloadRequest, overrideAccess: boolean, slug: string) => {
    return await withNodeCache(async (slug: string) => {
        const res = await req.payload.find({
          collection: COLLECTION_SLUG_TENANTS,
          depth: 0,
          req,
          overrideAccess: overrideAccess,
          where: {
            slug: {
              equals: slug,
            },
          },
          select: {}
        })

        return res.docs[0].id
    }, ['tenantIdBySlug', slug], {
        // Tenant IDs won't change, so we can cache indefinitely
        revalidate: 0 
    } )(slug);
};