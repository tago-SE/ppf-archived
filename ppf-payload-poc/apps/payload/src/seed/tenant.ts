import {
  COLLECTION_SLUG_DYANMIC_PAGE,
  COLLECTION_SLUG_TENANTS,
} from "@/collections/config";
import { Payload } from "payload";
import { Tenant } from "@/payload-types";

export type TenantSeedData = {
  name: string;
  slug: string;
} & Pick<Tenant, "siteLocales" | "defaultLocale" | "siteUrl" | "security">;

export const createTenant = async (
  payload: Payload,
  { name, slug, defaultLocale, siteLocales, security, siteUrl }: TenantSeedData
) => {
  return await payload.create({
    collection: COLLECTION_SLUG_TENANTS,
    data: {
      name,
      slug,
      defaultLocale,
      siteLocales,
      security,
      siteUrl,
    },
  });
};

export const updateTenantWithLinks = async (
  payload: Payload,
  {
    tenantId,
    homePageId,
    links,
  }: {
    tenantId: string;
    homePageId: string;
    links?: {
      type?: "reference" | "custom";
      label?: string;
      reference: {
        relationTo?: string;
        value?: string;
      };
    }[];
  }
) => {
  await payload.update({
    collection: COLLECTION_SLUG_TENANTS,
    id: tenantId,
    data: {
      headerNavItems: [
        {
          link: {
            label: "Home",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: homePageId,
            },
          },
        },
        ...(links?.map(({ label, type, reference }) => ({
          link: {
            label,
            type,
            reference: {
              relationTo: reference.relationTo,
              value: reference.value,
            } as any,
          },
        })) ?? []),
      ],
      footerNavItems: [
        {
          link: {
            label: "Home",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: homePageId,
            },
          },
        },
        {
          link: {
            label: "Payload Docs",
            newTab: true,
            type: "custom",
            url: "https://payloadcms.com/docs/",
          },
        },
      ],
    },
  });
};
