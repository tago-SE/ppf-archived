import type { FieldAccess } from "payload";
import {
  principalTypeFieldName,
  TenantAuthenticationPrincipalType,
} from "../Tenants/fields/authentication/authenticationOptions";

export enum UserPrincipalTypes {
  CurityClient = TenantAuthenticationPrincipalType.CurityClient,
  EntraServicePrincipal = TenantAuthenticationPrincipalType.ServicePrincipal,
  EntraUser = "entraUser",
}

export const userTypesThatCanSignIn = [UserPrincipalTypes.EntraUser] as [
  UserPrincipalTypes.EntraUser
];


const createFieldAccessChecker = (
  fieldName: string,
  expectedTypes: UserPrincipalTypes[]
): FieldAccess => {
  return ({ data }) => {
    const userPrincipalType = data?.[fieldName] as UserPrincipalTypes;
    return expectedTypes.includes(userPrincipalType);
  };
};

export const showCurityFields = createFieldAccessChecker(
  principalTypeFieldName,
  [UserPrincipalTypes.CurityClient]
);

export const showEntraFields = createFieldAccessChecker(
  principalTypeFieldName,
  [UserPrincipalTypes.EntraServicePrincipal, UserPrincipalTypes.EntraUser]
);

/**
 * Limit read-access of this top-level property to only accept NextAuth users.
 */
export const showNextAuthFields = createFieldAccessChecker(
  principalTypeFieldName,
  [UserPrincipalTypes.EntraUser]
);
