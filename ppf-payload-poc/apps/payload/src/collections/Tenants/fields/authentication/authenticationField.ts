import { type ArrayField, type Field, type RowField } from "payload";
import {
  tenantAuthOptions as options,
  principalTypeFieldName,
  tenantAuthAllowedEnvironments,
} from "./authenticationOptions";
import { TenantAuthenticationPrincipalType } from "./authenticationOptions";
import { entraGroupFields } from "../entraGroupFields";
import { curityClientTenantFields } from "@/collections/Tenants/fields/curityClientFields";
import { servicePrincipalFields } from "../servicePrincipalFields";
import { DeployEnv, deployEnvConfig } from "@/lib/utils/getCurrentDeployedEnv";
import { TenantAuthNArray } from "@/payload-types";
import { type TenantAuthentication } from "../../service/getTenantPermissions";

const getValueAtPath = (obj: any, path: (string | number)[]) => {
  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );
};

const tenantAuthToUniqueIdentifier = (x: TenantAuthentication) => {
  if (
    x.principalType === TenantAuthenticationPrincipalType.Group &&
    x[TenantAuthenticationPrincipalType.Group]
  ) {
    return `${x.principalType}.${x.group.objectId}`;
  }
  if (
    x.principalType === TenantAuthenticationPrincipalType.ServicePrincipal &&
    x[TenantAuthenticationPrincipalType.ServicePrincipal]
  ) {
    return `${x.principalType}.${
      x[TenantAuthenticationPrincipalType.ServicePrincipal].objectId
    }.${x[TenantAuthenticationPrincipalType.ServicePrincipal].tid}`;
  }
  if (
    x.principalType === TenantAuthenticationPrincipalType.CurityClient &&
    x[TenantAuthenticationPrincipalType.CurityClient]
  ) {
    return `${x.principalType}.${
      x[TenantAuthenticationPrincipalType.CurityClient].clientId
    }.${x[TenantAuthenticationPrincipalType.CurityClient].env}`;
  }
  return "";
};

const createAuthenticationRow = ({
  principalType,
  interfaceName,
  label,
  fields,
}: {
  principalType: TenantAuthenticationPrincipalType;
  interfaceName: string;
  fields: Field[];
  label: string;
}): RowField => ({
  type: "row",
  fields: [
    {
      name: principalType,
      type: "group",
      interfaceName,
      label,
      validate: (_value, { data, path }) => {
        const { authentication } = data as unknown as {
          authentication: TenantAuthNArray;
        };
        const seenHashKeys = new Set<string>();
        for (let [index, auth] of (authentication || []).entries()) {
          const candidate = {
            path: ["authentication", "" + index, auth.principalType],
            hashKey: tenantAuthToUniqueIdentifier(auth),
          };
          if (seenHashKeys.has(candidate.hashKey)) {
            if (JSON.stringify(candidate.path) === JSON.stringify(path)) {
              return `Duplicate entry detected.`;
            }
          } else {
            seenHashKeys.add(candidate.hashKey);
          }
        }
        return true;
      },
      admin: {
        condition: (data, _, { path }: { path: (string | number)[] }) => {
          const parent = getValueAtPath(data, path.slice(0, -1));
          return parent?.[principalTypeFieldName] === principalType;
        },
      },
      fields: fields,
    },
  ],
});

export const authenticationField: ArrayField = {
  type: "array",
  name: "authentication",
  interfaceName: "TenantAuthNArray",
  minRows: 0,
  admin: {
    description:
      "Select the authentication method you would like to support for accessing the CMS as a consuming system.",
    components: {
      RowLabel: {
        path: "@/components/Tenant/AuthenticatorRowTitle#default",
        clientProps: {
          fieldPath: [principalTypeFieldName],
        },
      },
    },
  },
  defaultValue: [],
  fields: [
    {
      type: "row",
      fields: [
        {
          name: principalTypeFieldName,
          type: "select",
          required: true,
          options: Object.values(options),
          validate: (value: any) => {
            const selectedValue: TenantAuthenticationPrincipalType | undefined =
              value;
            // PrincipalType is not set so it does not need to check environment
            if (!selectedValue) {
              return true;
            }
            return (
              (
                tenantAuthAllowedEnvironments[selectedValue] as DeployEnv[]
              ).includes(deployEnvConfig.currentEnv) ||
              `Not allowed in ${deployEnvConfig.currentEnv}.`
            );
          },
        },
      ],
    },
    createAuthenticationRow({
      principalType: TenantAuthenticationPrincipalType.Group,
      label: options.group.label,
      interfaceName: "EntraGroupAuthN",
      fields: [entraGroupFields.objectId, entraGroupFields.name],
    }),
    createAuthenticationRow({
      principalType: TenantAuthenticationPrincipalType.ServicePrincipal,
      label: options.servicePrincipal.label,
      interfaceName: "EntraServicePrincipalAuthN",
      fields: Object.values(servicePrincipalFields),
    }),
    createAuthenticationRow({
      principalType: TenantAuthenticationPrincipalType.CurityClient,
      label: options.curityClient.label,
      interfaceName: "CuritySystemFlowAuthN",
      fields: Object.values(curityClientTenantFields),
    }),
  ],
};
