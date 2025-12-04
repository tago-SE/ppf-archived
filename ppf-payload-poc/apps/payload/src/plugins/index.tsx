import { accessChecks } from "@/collections/access";
import {
  canCreateCollectionAsync,
  canMutateCollectionAsync,
  canReadCollectionAsync,
} from "@/collections/access/defaultCollectionAccess";
import {
  COLLECTION_REFS_TRACK,
  COLLECTION_SLUG_CATEGORIES,
  COLLECTION_SLUG_DYANMIC_PAGE,
  COLLECTION_SLUG_MEDIA,
  COLLECTION_SLUG_REUSABLE_BLOCKS,
  COLLECTION_SLUG_USERS,
} from "@/collections/config";
import { createAppCredential } from "@/lib/azure/identity";
import { azureStorage } from "@/lib/azure/storage-azure";
import { getSearchableContent } from "@/lib/utils/search";
import { Page, Tenant } from "@/payload-types";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { tenantField } from "@payloadcms/plugin-multi-tenant/fields";
import { getTenantListFilter } from "@payloadcms/plugin-multi-tenant/utilities";
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs";
import { searchPlugin } from "@payloadcms/plugin-search";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import type { CollectionSlug, Config, Plugin, Where } from "payload";
import { apiDocsPlugins } from "./payload-oapi";
import { editedByFieldPlugin } from "./edited-by-field";

const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | Payload Website Template`
    : "Payload Website Template";
};

const generateURL: GenerateURL<Page> = ({ doc, req: { payload } }) => {
  const url = (doc.tenant as Tenant).siteUrl ?? "";
  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  ...apiDocsPlugins,
  searchPlugin({
    collections: [COLLECTION_SLUG_DYANMIC_PAGE],
    beforeSync: async ({ searchDoc, originalDoc, req }) => {
      if (originalDoc.tenant.id) {
        searchDoc.tenant = originalDoc.tenant.id;
      }

      const text = getSearchableContent({
        req,
        collectionSlug: searchDoc.doc.relationTo as CollectionSlug,
        data: originalDoc as any,
      });
      searchDoc.content = text;

      return searchDoc;
    },
    searchOverrides: {
      access: {
        create: canCreateCollectionAsync,
        delete: canMutateCollectionAsync,
        read: canReadCollectionAsync,
        update: canMutateCollectionAsync,
      },
      admin: {
        defaultColumns: ["title", "content", "tenant"],
        hidden: (args) => {
          return !accessChecks.user.isAdmin.check(args.user as unknown as any);
        },
        // NOTE: adding simplified version of https://github.com/payloadcms/payload/blob/main/packages/plugin-multi-tenant/src/utilities/withTenantListFilter.ts
        // This is needed since we're manually adding tenant field
        baseListFilter: (args) => {
          const filterConstraints = [];
          const tenantListFilter = getTenantListFilter({
            req: args.req,
            tenantFieldName: "tenant",
            tenantsCollectionSlug: "tenants",
          });

          if (tenantListFilter) {
            filterConstraints.push(tenantListFilter);
          }

          if (filterConstraints.length) {
            const combinedWhere: Where = { and: [] };
            filterConstraints.forEach((constraint) => {
              if (
                combinedWhere.and &&
                constraint &&
                typeof constraint === "object"
              ) {
                combinedWhere.and.push(constraint);
              }
            });
            return combinedWhere;
          }

          return null;
        },
      },
      fields: ({ defaultFields }) => {
        return [
          ...defaultFields,
          // Manually adding tenant field, because of tenant plugin not fully working together with search plugin
          {
            ...tenantField({
              name: "tenant",
              tenantsCollectionSlug: "tenants",
              unique: false,
            }),
            admin: {
              hidden: false,
            },
            label: "Tenant",
          },
          {
            name: "content",
            type: "textarea",
            localized: true,
            admin: {
              readOnly: true,
            },
          },
        ];
      },
      graphQL: {
        disableQueries: true,
        disableMutations: true,
      },
    },
  }),
  multiTenantPlugin<Config>({
    collections: {
      [COLLECTION_SLUG_MEDIA]: {},
      [COLLECTION_SLUG_CATEGORIES]: {},
      [COLLECTION_SLUG_DYANMIC_PAGE]: {},
      [COLLECTION_SLUG_REUSABLE_BLOCKS]: {},
      [COLLECTION_REFS_TRACK]: {}

      // NOTE: commeting this out for some time as theres bug in tenant plugin - it takes tenant from cookie and it messes up create and update api's
      // search: {}
    },
    // Controls access for tenant field in other collections, for example, media, page, posts
    // Possible use case - if page is already published it's not possible to change tenant
    tenantField: {
      access: {
        read: () => true,
        create: () => true,
        update: () => false,
      },
    },
    tenantsArrayField: {
      includeDefaultField: false,
    },
    // METHOD NOT ASYNC, can't use await isSuperAdmin(args)
    userHasAccessToAllTenants: () => {
      // If this is set to false it tries to fetch data from DB with "where tenant" constraint
      // but since we're using virtual fields this is not an option. So to prevent this bug,
      // we need to disable "where tenant" constraint and then manage access control individually for each collection
      return true;
    },
  }),
  nestedDocsPlugin({
    collections: [COLLECTION_SLUG_CATEGORIES, COLLECTION_SLUG_DYANMIC_PAGE],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ""),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  editedByFieldPlugin({
    userSlug: COLLECTION_SLUG_USERS
  }),

  // Disable azure storage in integration tests to avoid azure managed identity complexities
  ...process.env.NODE_ENV === 'test' ? [] : [
    azureStorage({
      collections: {
        media: true,
      },
      connectionString: createAppCredential(),
      allowContainerCreate: false,
      baseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL!,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
    })
  ]
];
