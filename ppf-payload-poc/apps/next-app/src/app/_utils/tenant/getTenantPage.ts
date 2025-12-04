import { getTenant } from "./getTenant";

interface GetTenantPageResult {
  data: {
    /**
     * If no tenant is returned it means that the user is either unauthorized or the tenant does not exist.
     */
    tenant?: any;
    /**
     * If the page is not found it means the user is either unauthorized or the tenant does not exist.
     */
    page?: any;
  };
  /**
   * Error message
   */
  error?: string;
}

export async function getTenantPage(tenantId: string, pageSlug: string, token?: string): Promise<GetTenantPageResult> {
  let page = undefined;
  let tenant = undefined;
  try {
    const { data: tenantResult, error: tennantError } = await getTenant(tenantId, token);
    if (tennantError || !tenantResult) {
      return { data: { tenant: tenantResult, page: undefined }, error: tennantError };
    }
    tenant = tenantResult;

    const pageUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/pages?where[and][0][tenant.slug][equals]=${tenantId}&where[and][1][slug][equals]=${pageSlug}`;
    const pageResponse = await fetch(pageUrl, {
      headers: {
        Authorization: token ? `JWT ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.statusText}`);
    }
    const pageData = await pageResponse.json();
    if (pageData.docs.length === 0) {
      throw new Error(`Page not found: ${pageSlug}`);
    }
    if (pageData.docs.length > 1) {
      console.warn(`Found more than one page for [${tenantId}][${pageSlug}], returning the first one.`);
    }
    page = pageData.docs[0];
  } catch (error) {
    console.error(error);
    return { data: { tenant: tenant, page: page }, error: error?.toString() || "An error occurred." };
  }
  return { data: { tenant, page } };
}
