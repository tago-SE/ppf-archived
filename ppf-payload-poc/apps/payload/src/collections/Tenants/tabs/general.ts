import { ensureUniqueField } from "@/collections/hooks/ensureUniqueField";
import { onlyAlphanumericUnderscoreAndSpace } from "@/collections/hooks/ensureValidCharacters";
import { defaultLocale, locales } from "@/locales";
import { tenantGeneralFieldAccess } from "../access";
import { createUnnamedTenantTab } from "./createTenantTab";

export const tenantGeneralTab = createUnnamedTenantTab({
  label: "General",
  access: tenantGeneralFieldAccess,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [onlyAlphanumericUnderscoreAndSpace, ensureUniqueField],
      },
    },
    // The domains field allows you to associate one or more domains with a tenant.
    // This is used to determine which tenant is associated with a specific domain,
    // for example, 'abc.localhost.com' would match to 'Tenant 1'.

    // Uncomment this field if you want to enable domain-based tenant handling.
    // {
    //   name: 'domains',
    //   type: 'array',
    //   fields: [
    //     {
    //       name: 'domain',
    //       type: 'text',
    //       required: true,
    //     },
    //   ],
    //   index: true,
    // },
    {
      name: "slug",
      type: "text",
      admin: {
        description:
          "A unique, URL-friendly identifier used for constructing web paths. Example: '/tenant-slug/page-slug'.",
      },
      index: true,
      required: true,
      hooks: {
        beforeValidate: [ensureUniqueField],
      },
    },
    {
      name: "defaultLocale",
      type: "select",
      hasMany: false,
      index: false,
      admin: {
        description: "Default locale for the portal frontend.",
      },
      options: locales.map((l) => ({
        label: l.label,
        value: l.code,
      })),
      defaultValue: defaultLocale,
    },
    {
      name: "siteLocales",
      type: "select",
      index: false,
      admin: {
        description: "Available website locales.",
      },
      hasMany: true,
      defaultValue: defaultLocale,
      options: locales.map((l) => ({
        label: l.label,
        value: l.code,
      })),
    },
    {
      name: "siteUrl",
      label: "Site URL",
      type: "text",
      required: false,
    },
  ],
});
