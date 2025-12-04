type GetTenantResult = {
  data?: any;
  error?: string;
};

export async function getTenant(tenantId: string, token?: string): Promise<GetTenantResult> {
  let data = undefined;
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required.");
    }
    const tenantUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/tenants?where[slug][equals]=${tenantId}`;
    const tenantResponse = await fetch(tenantUrl, {
      headers: {
        Authorization: token ? `JWT ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    if (!tenantResponse.ok) {
      throw new Error(`Failed to fetch tenant: ${tenantResponse.statusText}`);
    }
    const tenantData = await tenantResponse.json();
    if (tenantData.docs.length === 0) {
      throw new Error("Tenant not found.");
    }
    data = tenantData.docs[0];
  } catch (error) {
    console.error(error);
    return { data: undefined, error: error?.toString() || "An error occurred." };
  }
  return { data };
}
