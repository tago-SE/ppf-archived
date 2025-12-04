import { getAllTenantsWithSecuritySelect } from "@/collections/Tenants/service/getTenants";
import { tenantHeaderPredicate } from "@/lib/auth/utils/headers/x-ppf-tenant";
import { Payload } from "payload";

type HeaderTenantsArgs = {
  payload: Payload;
  headers: Headers;
  responseHeaders: Headers;
};

/**
 * Fetches all tenants and checks if the header tenant exists. If the tenant header field is malformed the response header will be updated accordingly.
 */
export const handleHeaderTenants = async ({
  payload,
  headers,
  responseHeaders,
}: HeaderTenantsArgs) => {
  const allTenants = await getAllTenantsWithSecuritySelect(payload);
  const tenantPredicate = tenantHeaderPredicate(headers, responseHeaders);
  const headerTenant = allTenants.find(tenantPredicate);
  return {
    allTenants,
    headerTenant,
  };
};
