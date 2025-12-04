import { notFound } from "next/navigation";
import React from "react";
import { RenderPage } from "../../_components/RenderPage";
import { UnauthorizedPage } from "../../_components/UnauthorizedPage";
import { getTenantPage } from "@/app/_utils/tenant/getTenantPage";
import { userWithRedirect } from "@/app/_utils/user/userWithRedirect";

type RouteParams = {
  slug?: string[];
};

async function Page({ params }: { params: Promise<RouteParams> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID!;
  const pageSlug = slug ? slug.join("/") : "home";
  const { token } = await userWithRedirect({
    nullUserRedirect: `/login?redirect=${encodeURIComponent("/" + pageSlug)}`,
  });
  const {
    data: { tenant, page },
    error: _,
  } = await getTenantPage(tenantId, pageSlug, token);
  if (!tenant) {
    return <UnauthorizedPage />;
  }
  if (!page) {
    return notFound();
  }
  return <RenderPage data={page} />;
}

export default Page;