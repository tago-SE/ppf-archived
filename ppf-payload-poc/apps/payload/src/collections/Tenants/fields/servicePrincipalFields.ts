import { minRequiredManagedIdentityClaims } from "@/lib/auth/tokens/entraid";
import type { Field, SelectField, TextField } from "payload";

const defaultAzureTenantId =
  process.env.AZURE_TENANT_ID ?? "de7e7a67-ae61-49d2-97a7-526c910ad675";

export const servicePrincipalFields = {
  objectId: {
    // ObjectId == claims.oid & claims.sub
    name: "objectId",
    label: "Object (Principal) ID",
    type: "text",
    required: true,
    defaultValue: "",
    minLength: 36,
  } as TextField,
  clientId: {
    // ClientId == claims.appid
    name: "clientId",
    label: "Client ID",
    type: "text",
    required: true,
    defaultValue: "",
    minLength: 36,
  } as TextField,
  tenantId: {
    name: "tid",
    type: "text",
    label: "Azure Tenant ID",
    required: true,
    index: true,
    defaultValue: defaultAzureTenantId,
    admin: {
      readOnly: true,
    },
  } as TextField,
  issuer: {
    name: "iss",
    label: "Issuer",
    type: "text",
    virtual: true,
    admin: {
      readOnly: true,
    },
    hooks: {
      afterRead: [
        async ({ siblingData }) => {
          if (!!siblingData.tid && typeof siblingData.tid == "string") {
            return "https://sts.windows.net/" + siblingData.tid + "/";
          }
        },
      ],
    },
  } as TextField,
  audience: {
    name: "aud",
    label: "Audience",
    type: "text",
    virtual: true,
    admin: {
      readOnly: true,
    },
    defaultValue: "https://management.azure.com",
  } as TextField,
  requiredClaims: {
    name: "requiredClaims",
    type: "select",
    options: minRequiredManagedIdentityClaims,
    defaultValue: minRequiredManagedIdentityClaims,
    hasMany: true,
    virtual: true,
    admin: {
      readOnly: true,
    },
  } as SelectField,
}