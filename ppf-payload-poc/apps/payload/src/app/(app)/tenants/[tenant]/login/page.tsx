import React from "react";
import { redirect } from "next/navigation";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { headers as getHeaders } from "next/headers";
import { pageRoutes } from "@/routes";

type RouteParams = {
  tenant: string;
};

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });
  if (!user) {
    redirect(
      `${pageRoutes.AdminLogin}?redirect=${encodeURIComponent(
        `/${resolvedParams.tenant}`
      )}`
    );
  } else {
    // Tenant home
    redirect(`/${resolvedParams.tenant}`);
  }
}
