import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { getAllTenants } from "@/collections/Tenants/service/getTenants";
import { Tenant } from "@/payload-types";

const HeaderPrefix = "x-ppf-tenant";
export const TenantBySlugHeader = HeaderPrefix + "-slug";
const TenantByIdHeader = HeaderPrefix + "-id";
const TenantErrorInfoHeader = HeaderPrefix + "-error";

export const tenantHeaderPredicate = (
  headers: Headers,
  responseHeaders?: Headers
) => {
  const tenantSlug = headers.get(TenantBySlugHeader);
  const tenantId = headers.get(TenantByIdHeader);
  if (!tenantId && !tenantSlug) {
    responseHeaders?.append(
      `${TenantErrorInfoHeader}`,
      `Missing required header: '${TenantByIdHeader}' or '${TenantBySlugHeader}'`
    );
    return () => false;
  }
  return (tenant: Pick<Tenant, "id" | "slug">) =>
    (!!tenantId && tenant.id === tenantId) ||
    (!!tenantSlug && tenant.slug === tenantSlug);
};

export async function resolveTenantFromHeaderAsync(headers: Headers) {
  const payload = await getPayloadWithConfig();
  const allTenants = await getAllTenants(payload, { depth: 0 });
  return allTenants.find(tenantHeaderPredicate(headers));
}
