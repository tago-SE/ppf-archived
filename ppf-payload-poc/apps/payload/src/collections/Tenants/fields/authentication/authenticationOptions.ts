import { deployEnvConfig } from "@/lib/utils/getCurrentDeployedEnv";

export enum TenantAuthenticationPrincipalType {
  Group = "group",
  ServicePrincipal = "servicePrincipal",
  CurityClient = "curityClient",
}

export const tenantAuthOptions: Record<
  TenantAuthenticationPrincipalType,
  { label: string; value: TenantAuthenticationPrincipalType }
> = {
  [TenantAuthenticationPrincipalType.Group]: {
    label: "Entra Group",
    value: TenantAuthenticationPrincipalType.Group,
  },
  [TenantAuthenticationPrincipalType.ServicePrincipal]: {
    label: "Entra Service Principal",
    value: TenantAuthenticationPrincipalType.ServicePrincipal,
  },
  [TenantAuthenticationPrincipalType.CurityClient]: {
    label: "Curity ClientCredentials",
    value: TenantAuthenticationPrincipalType.CurityClient,
  },
};

export const tenantAuthAllowedEnvironments = {
  // Not supported in PROD
  [TenantAuthenticationPrincipalType.Group]:
    deployEnvConfig.allEnvironmentsButProd,
  // Not supported in PROD
  [TenantAuthenticationPrincipalType.ServicePrincipal]:
    deployEnvConfig.allEnvironmentsButProd,
  // Supported in DEV TEST PROD
  [TenantAuthenticationPrincipalType.CurityClient]:
    deployEnvConfig.allEnvironments,
};

export const principalTypeFieldName = "principalType";
