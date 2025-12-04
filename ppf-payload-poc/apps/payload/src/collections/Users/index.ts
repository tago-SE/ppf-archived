import type { CollectionConfig } from "payload";
import { ensureUniqueField } from "../hooks/ensureUniqueField";
import {
  COLLECTION_GROUP_AUTH,
  COLLECTION_SLUG_TENANTS,
  COLLECTION_SLUG_USERS,
  SYSTEM_ROLE_SUPERADMIN,
  TENANT_ROLE_ADMIN,
  TENANT_ROLE_USER,
} from "../config";

import { collectionAuthConfig } from "@/lib/auth/payload/collection/strategy";
import { IdType } from "../../lib/auth/tokens/entraid/EntraIdClaims";
import { extractUserLinkAccount } from "@/lib/auth/adapters/account";
import {
  logoutEndpoint,
  meEndpoint,
  refreshEndpoint,
} from "../../lib/auth/payload/collection/endpoints";
import { principalTypeFieldName } from "../Tenants/fields/authentication/authenticationOptions";
import {
  showCurityFields,
  showEntraFields,
  showNextAuthFields,
  UserPrincipalTypes,
} from "./userPrincipalTypes";
import { accessChecks } from "../access";
import { combinedAccessCheck } from "../access/combinedAccessCheck";
import { userAccessCheck } from "../access/user";
import { CustomCollectionOpenApiConfiguration } from "@/plugins/payload-oapi/types";

const userOpenApiConfig: CustomCollectionOpenApiConfiguration = {
  openapi: {
    paths: {
      "/api/{slug}": {
        post: {
          hidden: true,
        },
      },
      "/api/{slug}/{id}": {
        patch: {
          hidden: true,
        },
      },
    },
  },
};

export const Users: CollectionConfig = {
  slug: COLLECTION_SLUG_USERS,
  custom: {
    ...userOpenApiConfig,
  },
  access: {
    read: accessChecks.user.belongToSameTenantOrSelf.access,
    delete: accessChecks.user.isAdmin.access,
    create: () => false,
    update: () => false,
  },
  admin: {
    useAsTitle: "email",
    group: COLLECTION_GROUP_AUTH,
  },
  auth: collectionAuthConfig,
  endpoints: [logoutEndpoint, refreshEndpoint, meEndpoint],
  fields: [
    {
      name: "oid",
      type: "text",
      admin: { readOnly: true },
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "sub",
      type: "text",
      saveToJWT: true,
      admin: { readOnly: true },
      required: false,
      index: true,
    },
    {
      name: "password",
      type: "text",
      virtual: true,
      hidden: true,
    },
    {
      name: "username",
      type: "text",
      hooks: {
        beforeValidate: [ensureUniqueField],
      },
      index: false,
      admin: { readOnly: true },
    },
    { name: "name", type: "text", saveToJWT: true, admin: { readOnly: true } },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      saveToJWT: true,
      admin: { readOnly: true },
    },
    {
      name: "microsoftGroupIds",
      label: "Entra Groups",
      type: "text",
      hasMany: true,
      access: {
        read: combinedAccessCheck.and.fieldAccess(
          showEntraFields,
          userAccessCheck.isAdminOrSelf.fieldAccess
        ),
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: "emailVerified",
      type: "date",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "image",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "userType",
      type: "select",
      required: true,
      admin: { readOnly: true, hidden: false },
      options: [IdType.App, IdType.User],
    },
    {
      /**
       * Current account linked on login. Changes when id_token is passed in login.
       */
      name: "linkAccount",
      access: {
        read: combinedAccessCheck.and.fieldAccess(
          showNextAuthFields,
          userAccessCheck.isAdminOrSelf.fieldAccess
        ),
      },
      admin: {
        hidden: false,
        condition: (data) => {
          const userPrincipalType = data[
            principalTypeFieldName
          ] as UserPrincipalTypes;
          return userPrincipalType == UserPrincipalTypes.EntraServicePrincipal;
        },
      },
      type: "group",
      fields: [
        {
          name: "provider",
          type: "text",
          admin: { readOnly: true, hidden: false },
        },
        {
          name: "providerAccountId",
          type: "text",
          admin: { readOnly: true, hidden: false },
        },
        {
          name: "expires_at",
          type: "text",
          virtual: true,
          admin: {
            readOnly: true,
          },
          hooks: {
            afterRead: [
              ({ data }) => {
                // Debug purposes only, to be removed
                const account = extractUserLinkAccount(data as any);
                return new Date(
                  (account?.expires_at ?? 0) * 1000
                ).toISOString();
              },
            ],
          },
        },
        {
          name: "expires_in",
          type: "number",
          virtual: true,
          admin: {
            readOnly: true,
          },
          hooks: {
            afterRead: [
              ({ data }) => {
                // Debug purposes to be removed
                const account = extractUserLinkAccount(data as any);
                const d = new Date((account?.expires_at ?? 0) * 1000);
                return (d.getTime() - Date.now()) / 1000;
              },
            ],
          },
        },
      ],
    },
    {
      name: "accounts",
      type: "array",
      saveToJWT: false,
      access: {
        read: combinedAccessCheck.and.fieldAccess(
          showNextAuthFields,
          userAccessCheck.isAdminOrSelf.fieldAccess
        ),
      },
      admin: {
        readOnly: true,
        components: {
          RowLabel: {
            path: "@/components/shared/ArrayFieldTitle#default",
            clientProps: {
              fieldPath: ["provider"],
            },
          },
        },
      },
      fields: [
        {
          type: "row",
          admin: {
            readOnly: true,
          },
          fields: [
            { name: "provider", type: "text", admin: { readOnly: true } },
            {
              name: "providerAccountId",
              type: "text",
              admin: { readOnly: true },
            },
            { name: "type", type: "text", admin: { readOnly: true } },
            { name: "refresh_token", type: "text", hidden: true },
            { name: "access_token", type: "text", hidden: true },
            { name: "expires_at", type: "number", hidden: false },
            { name: "token_type", type: "text", hidden: true },
            { name: "scope", type: "text", hidden: true },
            { name: "id_token", type: "text", hidden: true },
            { name: "session_state", type: "text", hidden: true },
          ],
        },
      ],
    },
    {
      name: "verificationTokens",
      type: "array",
      saveToJWT: false,
      hidden: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: combinedAccessCheck.and.fieldAccess(
          showNextAuthFields,
          userAccessCheck.isAdminOrSelf.fieldAccess
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "identifier", type: "text", admin: { readOnly: true } },
            { name: "token", type: "text", admin: { readOnly: true } },
            { name: "expires", type: "date", admin: { readOnly: true } },
          ],
        },
      ],
    },
    {
      name: COLLECTION_SLUG_TENANTS,
      type: "array",
      index: true,
      admin: {
        readOnly: true,
        components: {
          RowLabel: {
            path: "@/components/shared/ArrayFieldTitle#default",
            clientProps: {
              fieldPath: ["name"],
            },
          },
        },
      },
      fields: [
        {
          name: "tenant",
          type: "relationship",
          index: true,
          relationTo: COLLECTION_SLUG_TENANTS,
          maxDepth: 0,
        },
        {
          name: "name",
          type: "text",
          admin: {
            condition: () => false,
          },
        },
        {
          name: "roles",
          type: "select",
          hasMany: true,
          saveToJWT: true,
          options: [
            TENANT_ROLE_ADMIN,
            TENANT_ROLE_USER,
            SYSTEM_ROLE_SUPERADMIN,
          ],
        },
      ],
      saveToJWT: true,
    },
    {
      name: principalTypeFieldName,
      type: "select",
      // Should be required
      // index: true,
      // required: true,
      admin: {
        readOnly: true,
      },
      options: [
        UserPrincipalTypes.EntraUser,
        UserPrincipalTypes.EntraServicePrincipal,
        UserPrincipalTypes.CurityClient,
      ],
    },
    {
      name: UserPrincipalTypes.CurityClient,
      type: "group",
      access: {
        read: combinedAccessCheck.and.fieldAccess(
          showCurityFields,
          userAccessCheck.isAdminOrSelf.fieldAccess
        ),
      },
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: "clientId",
          type: "text",
          index: true,
        },
        {
          name: "clientPartnerId",
          type: "text",
          index: true,
        },
        {
          name: "iss",
          label: "Issuer",
          type: "text",
          index: true,
        },
      ],
    },
  ],
};

export { Sessions } from "../Session";
