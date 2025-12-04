import { validateEntraIdToken } from "@/lib/auth/tokens/entraid/validateEntraIdClaims";
import {
  minRequiredManagedIdentityClaims,
  jwtVerifyEntraServicePrincipalThrows,
  jwtVerifyAnyEntraServicePrincipalThrows,
  type JWTVerifyEntraServicePrincipalOptions,
} from "./validateServicePrincipal";
import {
  AzureManagedIdentityAppClaims,
  EntraIDBaseClaims,
  EntraIDUserClaims,
  IdType,
} from "./EntraIdClaims";

export { validateEntraIdToken };
export { jwtVerifyEntraServicePrincipalThrows };
export { jwtVerifyAnyEntraServicePrincipalThrows };
export type {
  IdType,
  EntraIDBaseClaims,
  AzureManagedIdentityAppClaims,
  EntraIDUserClaims,
  JWTVerifyEntraServicePrincipalOptions,
};

export { minRequiredManagedIdentityClaims };
