import type {
  Access,
  AccessArgs,
  FieldBase,
  FieldAccess,
  Where,
} from "payload";
import { Tenant } from "@/payload-types";
import { resolveTenantFromHeaderAsync } from "@/lib/auth/utils/headers/x-ppf-tenant";
import {
  getUserTenantPermissions,
  getUserTenantRoles,
} from "../service/getTenantPermissions";
import { getUserTenantAccessIds } from "@/collections/Users/utils/getTenantAccessIDs";
import { isSuperAdmin, isUserAuthenticated } from "../../access/user/index";
import {
  SYSTEM_ROLE_SUPERADMIN,
  TENANT_ROLE_ADMIN,
} from "@/collections/config";

const createTenantFieldRoleFieldAccess =
  (allowedRoles: string[]): FieldAccess<Tenant> =>
  ({ id, req, ...args }) => {
    if (isSuperAdmin(req.user)) {
      return true;
    }
    const roles = getUserTenantRoles({
      tenant: args.data as Tenant,
      user: req.user!,
    }) as string[];
    return allowedRoles.some((role) => roles.includes(role));
  };

export const tenantSecurityFieldAccess: NonNullable<
  Pick<FieldBase, "access">["access"]
> = {
  // TODO: Adding seem to break the TenantSelector in the UI so ommiting that change for now
  // read: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN,TENANT_ROLE_ADMIN,TENANT_ROLE_USER ]),
  update: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN]),
  create: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN]),
};

export const tenantGeneralFieldAccess: NonNullable<
  Pick<FieldBase, "access">["access"]
> = {
  // TODO: Adding seem to break the TenantSelector in the UI so ommiting that change for now
  // read: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN,TENANT_ROLE_ADMIN,TENANT_ROLE_USER ]),
  update: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN]),
  create: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN]),
};

/**
 * Tenant 'Contributor' or 'Content Editor'
 */
export const tenantContentEditorFieldAccess: NonNullable<
  Pick<FieldBase, "access">["access"]
> = {
  // TODO: Adding seem to break the TenantSelector in the UI so ommiting that change for now
  // read: createTenantFieldRoleFieldAccess([SYSTEM_ROLE_SUPERADMIN,TENANT_ROLE_ADMIN,TENANT_ROLE_USER ]),
  update: createTenantFieldRoleFieldAccess([
    SYSTEM_ROLE_SUPERADMIN,
    TENANT_ROLE_ADMIN,
  ]),
  create: createTenantFieldRoleFieldAccess([
    SYSTEM_ROLE_SUPERADMIN,
    TENANT_ROLE_ADMIN,
  ]),
};

const getArgsTenant = async (args: AccessArgs<Tenant>) => {
  if (args.req.payloadAPI === "GraphQL") {
    return await resolveTenantFromHeaderAsync(args.req.headers);
  }
  return args.data;
};

export const readTenant = async (args: AccessArgs<Tenant>) => {
  if (!isUserAuthenticated(args.req.user)) {
    return false;
  }
  const userTenantIds = getUserTenantAccessIds(args.req.user!);
  // Only show tenants which the user has relationship to
  const where: Where = {
    or: [
      ...userTenantIds.map((tid) => ({
        id: {
          equals: tid,
        },
      })),
    ],
  };
  return where;
};

export const mutateTenant: Access<Tenant> = async (args) => {
  if (!isUserAuthenticated(args.req.user)) {
    return false;
  }
  const tenant = await getArgsTenant(args);
  return getUserTenantPermissions({ tenant, user: args.req.user! }).editor;
};
