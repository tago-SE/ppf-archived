// Maybe move whole thing somewhere else
import {
  CuritySystemFlowAuthN,
  EntraGroupAuthN,
  EntraServicePrincipalAuthN,
  Tenant,
  TenantAuthNArray,
  User,
} from "@/payload-types";
import { TenantAuthenticationPrincipalType } from "../fields/authentication/authenticationOptions";
import {
  SYSTEM_ROLE_SUPERADMIN,
  TENANT_ROLE_ADMIN,
  TENANT_ROLE_USER,
} from "@/collections/config";
import { UserPrincipalTypes } from "@/collections/Users/userPrincipalTypes";
import { userAccessCheck } from "@/collections/access/user";
import { curityIssuers } from "@/lib/auth/config";

// Perhaps refactor into something more readable from a configuration standpoint...?
// Add * to include all ?
// type CollectionAccess = Array<"create" | "read" | "update" | "delete">;
// type FieldAccess = Array<"create" | "read" | "update">;

// type RolePermissions = {
//   name: string;
//   description: string;
//   permissions: CollectionAccess;
//   fieldPermissions: {
//     [x: string]: FieldAccess;
//   };
// };

// const tenantRoles: RolePermissions[] = [
//   {
//     name: "tenant-admin",
//     description: "",
//     permissions: ["read", "update"],
//     fieldPermissions: {
//       authentication: ["read"],
//     },
//   },
//   {
//     name: "tenant-read",
//     description: "",
//     permissions: ["read"],
//     fieldPermissions: {
//       authentication: [],
//     },
//   },
//   {
//     name: "super-admin",
//     description: "",
//     permissions: ["read", "update", "delete", "create"],
//     fieldPermissions: {
//       authentication: ["read", "update", "create"],
//     },
//   },
// ] as const;

const tenantPrivilages = {
  reader: [TENANT_ROLE_ADMIN, TENANT_ROLE_USER, SYSTEM_ROLE_SUPERADMIN],
  editor: [TENANT_ROLE_ADMIN, SYSTEM_ROLE_SUPERADMIN],
};

export type TenantAuthentication = Omit<
  Exclude<TenantAuthNArray, null | undefined>[0],
  "id"
>;

type TenantPermissionsResult = {
  entraAdminGroupIds: string[];
  entraReadGroupIds: string[];
  authentication: {
    [TenantAuthenticationPrincipalType.Group]: EntraGroupAuthN[];
    [TenantAuthenticationPrincipalType.ServicePrincipal]: EntraServicePrincipalAuthN[];
    [TenantAuthenticationPrincipalType.CurityClient]: CuritySystemFlowAuthN[];
  };
};

const emptyResult: TenantPermissionsResult = {
  entraAdminGroupIds: [],
  entraReadGroupIds: [],
  authentication: {
    [TenantAuthenticationPrincipalType.Group]: [],
    [TenantAuthenticationPrincipalType.ServicePrincipal]: [],
    [TenantAuthenticationPrincipalType.CurityClient]: [],
  },
};

export const filterByTenantPrincipalType = <TResult>(
  array: TenantAuthentication[],
  principalType: TenantAuthenticationPrincipalType
): TResult[] => {
  try {
    return (
      array
        ?.filter((y) => y.principalType === principalType)
        ?.map((x) => x[principalType] as TResult) || []
    );
  } catch (error) {
    console.error(`Error filtering data for ${principalType}:`, error);
    return [];
  }
};

export const getTenantPermissions = (
  tenant?: Tenant | null
): TenantPermissionsResult => {
  if (!tenant) {
    return emptyResult;
  }

  const authenticationArray: TenantAuthentication[] =
    tenant?.security?.authentication || [];
  const editorGroups = tenant?.security?.editorGroups || [];
  const entraAdminGroupIds = (editorGroups || []).map((g) => g.objectId);

  const authenticationEntraGroups =
    filterByTenantPrincipalType<EntraGroupAuthN>(
      authenticationArray,
      TenantAuthenticationPrincipalType.Group
    );

  const entraReadGroupIds = authenticationEntraGroups.map((g) => g.objectId);

  const authentication = {
    [TenantAuthenticationPrincipalType.Group]: authenticationEntraGroups,
    [TenantAuthenticationPrincipalType.ServicePrincipal]:
      filterByTenantPrincipalType<EntraServicePrincipalAuthN>(
        authenticationArray,
        TenantAuthenticationPrincipalType.ServicePrincipal
      ),
    [TenantAuthenticationPrincipalType.CurityClient]:
      filterByTenantPrincipalType<CuritySystemFlowAuthN>(
        authenticationArray,
        TenantAuthenticationPrincipalType.CurityClient
      ),
  };

  return {
    entraAdminGroupIds: entraAdminGroupIds,
    entraReadGroupIds: entraReadGroupIds,
    authentication: authentication,
  };
};

// Move?
type UserTenant = Exclude<User["tenants"], null | undefined>[0];
export type TenantRoles = NonNullable<UserTenant["roles"]>;
//

type GetUserTenantPermissions = {
  tenant?: Tenant | null;
  user?: User;
};

const userIsTenantAdmin = (
  permissions: TenantPermissionsResult,
  user?: Pick<User, "microsoftGroupIds" | "principalType">
) => {
  return (
    !!user &&
    user.principalType === UserPrincipalTypes.EntraUser &&
    permissions.entraAdminGroupIds.length > 0 &&
    permissions.entraAdminGroupIds.some((groupId) =>
      (user.microsoftGroupIds || []).includes(groupId)
    )
  );
};

export const curityClientRead = (
  permissions: TenantPermissionsResult,
  user: Pick<User, "curityClient" | "principalType">
) => {
  if (
    user?.principalType === UserPrincipalTypes.CurityClient &&
    user?.curityClient &&
    user.curityClient.clientId &&
    user.curityClient.iss
  ) {
    const { clientId, iss } = user.curityClient!;
    return permissions.authentication[UserPrincipalTypes.CurityClient].some(
      (x) =>
        clientId === x.clientId &&
        (!!x.iss ? iss == x.iss : iss == curityIssuers[x.env])
    );
  }
  return false;
};

const servicePrincipalRead = (
  permissions: TenantPermissionsResult,
  user: Pick<User, "oid" | "principalType">
) => {
  if (
    user?.principalType === UserPrincipalTypes.EntraServicePrincipal &&
    user?.oid
  ) {
    return permissions.authentication[
      UserPrincipalTypes.EntraServicePrincipal
    ].some((x) => user.oid === x.objectId);
  }
  return false;
};

const userHasEntraReadGroup = (
  permissions: TenantPermissionsResult,
  user: Pick<User, "microsoftGroupIds">
) => {
  return permissions.entraReadGroupIds.some((groupId) => {
    return groupId && (user?.microsoftGroupIds || []).includes(groupId);
  });
};

const userCanReadTenant = (
  permissions: TenantPermissionsResult,
  user?: User
) => {
  return (
    !!user &&
    (curityClientRead(permissions, user) ||
      userHasEntraReadGroup(permissions, user) ||
      servicePrincipalRead(permissions, user))
  );
};

/**
 * Determines the users role to the tenant
 */
export const getUserTenantRoles = ({
  tenant,
  user,
}: GetUserTenantPermissions) => {
  let roles: TenantRoles = [];
  const permissions = getTenantPermissions(tenant);
  if (userAccessCheck.isAdmin.check(user!)) {
    roles.push(SYSTEM_ROLE_SUPERADMIN);
  }
  if (userIsTenantAdmin(permissions, user)) {
    roles.push(TENANT_ROLE_ADMIN);
  }
  if (userCanReadTenant(permissions, user)) {
    roles.push(TENANT_ROLE_USER);
  }
  return roles;
};

/**
 * Polymorphic get all user tenants
 */
export const getUserAllTenantsRoles = ({
  tenants,
  user,
}: {
  tenants?: Tenant[];
  user?: User;
}) => {
  return (tenants || [])
    .map((tenant) => {
      let roles: TenantRoles = getUserTenantRoles({
        tenant,
        user: user,
      });
      const { id, ...rest } = tenant;
      return {
        tenant: id,
        ...rest,
        name: tenant.name,
        roles,
      };
    })
    .filter((x) => x.roles.length > 0)
    .filter(Boolean);
};

// Maybe avoid using and just stick to roles
export const getUserTenantPermissions = ({
  tenant,
  user,
}: GetUserTenantPermissions) => {
  const tenantRoles = getUserTenantRoles({ tenant, user });
  return {
    reader: tenantRoles.some((x) => tenantPrivilages.reader.includes(x)),
    editor: tenantRoles.some((x) => tenantPrivilages.editor.includes(x)),
  };
};
