import type { Where } from "payload";

import configPromise from "@payload-config";
import { getPayload } from "payload";
import { headers as getHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { RenderPage } from "@/components/RenderPage";
import { UnauthorizedPage } from "@/components/UnauthorizedPage";
import { pageRoutes } from "@/routes";

type RouteParams = {
  tenant: string;
  slug?: string[];
};

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const tenant = resolvedParams.tenant;

  if (!user) {
    redirect(
      `${pageRoutes.AdminLogin.pathname}?redirect=${encodeURIComponent(
        `/${resolvedParams.tenant}${slug ? `/${slug.join("/")}` : ""}`
      )}`
    );
  }

  console.log("PARAMS", params, tenant, slug, user.name);
  const tenantsQuery = await payload.find({
    collection: "tenants",
    overrideAccess: false,
    user,
    where: {
      slug: {
        equals: tenant,
      },
    },
  });
  // If no tenant is found, the user does not have access
  // Show the login view
  if (tenantsQuery.docs.length === 0) {
    return <UnauthorizedPage data={{ tenant, slug, user }} />;
  }

  const slugConstraint: Where = slug
    ? {
        slug: {
          equals: slug.join("/"),
        },
      }
    : {
        or: [
          {
            slug: {
              equals: "",
            },
          },
          {
            slug: {
              equals: "home",
            },
          },
          {
            slug: {
              exists: false,
            },
          },
        ],
      };

  const pageQuery = await payload.find({
    collection: "pages",
    overrideAccess: false,
    user,
    where: {
      and: [
        {
          "tenant.slug": {
            equals: tenant,
          },
        },
        slugConstraint,
      ],
    },
  });

  const pageData = pageQuery.docs?.[0];

  if (!pageData) {
    return notFound();
  }

  return <RenderPage data={pageData} />;
}
