import type { SelectField, TextField } from "payload";
import {
  allowedCurityEnvironments,
  CurityEnv,
  curityIssuers,
  defaultCmsConsumerScopes,
  defaultCurityEnvironment,
} from "@/lib/auth/config";

export const curityClientTenantFields = {
  clientId: {
    name: "clientId",
    type: "text",
    required: true,
    defaultValue: "",
    index: true,
  } as TextField,
  audience: {
    name: "aud",
    label: "Audience",
    type: "text",
    required: true,
    defaultValue: "",
    index: true,
  } as TextField,
  scopes: {
    name: "scopes",
    type: "text",
    hasMany: true,
    // minRows: 1,
    defaultValue: defaultCmsConsumerScopes,
  } as TextField,
  environment: {
    name: "env",
    label: "Environment",
    type: "select",
    required: true,
    defaultValue: defaultCurityEnvironment,
    options: allowedCurityEnvironments as CurityEnv[],
  } as SelectField,
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
        async ({ value, data, siblingData, path, ...rest }) => {
          const environment: CurityEnv | undefined = siblingData.env;
          if (environment) {
            return curityIssuers[environment];
          }
        },
      ],
    },
  } as TextField,
};
