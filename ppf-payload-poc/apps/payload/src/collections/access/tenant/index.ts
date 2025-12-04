import { getUserTenantAccessIds } from "@/collections/Users/utils/getTenantAccessIDs";
import { isSuperAdmin, isUserAuthenticated } from "../user";
import type { Category, Media, Page, ReusableBlock } from "@/payload-types";
import type { Access, Where } from "payload";

import {
  SYSTEM_ROLE_SUPERADMIN,
  TENANT_ROLE_ADMIN,
} from "@/collections/config";
import { TenantRoles } from "@/collections/Tenants/service/getTenantPermissions";

/**
 * Any content type which has tenant relationship
 */
type WithTenantRelationship = Pick<
  Page | Media | ReusableBlock | Category,
  "tenant"
>;

function getDataTenantId(data: string | WithTenantRelationship | undefined) {
  if (typeof data === "string") {
    return data;
  }
  if (!data || !data.hasOwnProperty("tenant")) {
    return "";
  }
  if (typeof data.tenant == "string") {
    return data.tenant;
  } else {
    return data.tenant?.id!;
  }
}

export const canReadCollectionByTenantAccess: Access<
  WithTenantRelationship
> = ({ req, ...args }) => {
  if (!isUserAuthenticated(req.user)) false;
  if (isSuperAdmin(req.user)) return true;
  const userTenantIds = getUserTenantAccessIds(req.user!);
  const pageTenantId = getDataTenantId(args.data);
  const hasTenantAccess = userTenantIds.includes(pageTenantId);
  if (hasTenantAccess) {
    return true;
  }
  const where: Where = {
    or: [
      ...userTenantIds.map(
        (tid) =>
          ({
            "tenant.id": {
              equals: tid,
            },
          } as Where)
      ),
    ],
  };
  return where;
};

/**
 * Checks if user has at least one of the allowed roles in any tenant.
 * Useful when data isn't tenant-specific (e.g. creating new documents).
 */
export const makeHasSomeRoleInAnyTenantAccess = (
  allowedRoles: TenantRoles
): Access<WithTenantRelationship> => {
  return ({ req }) => {
    if (!isUserAuthenticated(req.user)) return false;
    if (isSuperAdmin(req.user)) return true;
    const userTenants = req.user!.tenants || [];
    return userTenants.some((tenant) =>
      (tenant.roles || []).some((role) => allowedRoles.includes(role))
    );
  };
};

/**
 * Checks if user has one of the allowed roles for the tenant tied to the data.
 * Useful when modifying tenant-scoped data.
 */
export const makeHasTenantRoleInRelatedTenantAccess = (
  allowedRoles: TenantRoles
): Access<WithTenantRelationship> => {
  return ({ req, ...args }) => {
    if (!isUserAuthenticated(req.user)) return false;
    if (isSuperAdmin(req.user)) return true;
    const relationshipTenantId = getDataTenantId(args.data);
    for (const tenant of req.user!.tenants || []) {
      if (tenant.tenant === relationshipTenantId) {
        return (tenant.roles || []).some((role) => allowedRoles.includes(role));
      }
    }
    return false;
  };
};
