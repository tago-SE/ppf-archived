// Not sure of the naming or placement of this
import { COLLECTION_SLUG_TENANTS } from "@/collections/config";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import type { Tenant, TenantsSelect } from "@/payload-types";
import { Payload, SelectType } from "payload";

const TTL = 10;
const collection = COLLECTION_SLUG_TENANTS;

type GetAllTenantsOptions = {
  select?: TenantsSelect<true> & { id?: true };
  depth?: number;
};

const _getAllTenants = async (
  payload: Payload,
  options: GetAllTenantsOptions
) => {
  return await payload
    .find({
      collection,
      disableErrors: true,
      overrideAccess: true,
      depth: options?.depth || 0,
      pagination: false,
      select: options?.select,
    })
    .then((pages) => pages.docs as Tenant[]);
};

export const getAllTenants = (
  payload: Payload,
  options?: GetAllTenantsOptions
) => {
  const _options = options ?? {};
  const optionsKey = JSON.stringify(options);
  const keys = [collection, "all", optionsKey];
  return withNodeCache(_getAllTenants, keys, {
    revalidate: TTL,
  })(payload, _options);
};

/**
 * Fields required for security checks on tenants
 */
const tenantSelectSecurityFields = {
  id: true,
  name: true,
  slug: true,
  security: true,
} as TenantsSelect<true>;

/**
 * Fetches all tenants but excluding all fields except the ones required to perform security checks
 */
export const getAllTenantsWithSecuritySelect = (payload: Payload) => {
  return getAllTenants(payload, { select: tenantSelectSecurityFields });
};

type FindTenantOptions = {
  tenantId?: string;
  tenantSlug?: string;
  select?: SelectType;
  depth?: number;
};

const _findTenant = async (payload: Payload, options: FindTenantOptions) => {
  const depth = options?.depth || 2;
  if (options.tenantId) {
    return await payload.findByID({
      collection,
      depth: depth,
      overrideAccess: true,
      disableErrors: true,
      id: options.tenantId,
    });
  } else if (options.tenantSlug) {
    const tenants = await payload.find({
      collection,
      depth: depth,
      overrideAccess: true,
      disableErrors: true,
      where: {
        slug: {
          equals: options.tenantSlug!,
        },
      },
    });
    return tenants.docs.length > 0 ? tenants.docs[0] : undefined;
  }
  return undefined;
};

export const findTenant = (payload: Payload, options: FindTenantOptions) => {
  const optionsKey = JSON.stringify(options);
  const keys = [collection, "find", optionsKey];
  return withNodeCache(_findTenant, keys, {
    revalidate: TTL,
  })(payload, options);
};
