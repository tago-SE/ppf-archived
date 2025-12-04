import { Payload } from "payload";
import { getAllTenantsWithSecuritySelect } from "@/collections/Tenants/service/getTenants";
import { getUserAllTenantsRoles } from "@/collections/Tenants/service/getTenantPermissions";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { getPrincipalEntraGroupIds } from "./getEntraPrincipalEntraGroupIds";
import type { ParsedProfile } from "@/lib/auth/providers/parseClaimsToUser";
import type { Tenant, User } from "@payload-types";
import { createUserFromProfile } from "@/lib/auth/providers/UserProfile";

type AuthenticateUserArgs = {
  payload: Payload;
  /**
   * Optional. If set tenants are fetched outside the upsert, if not set they will be fetched when checking for a existing user.
   */
  allTenants?: Tenant[];
  /**
   * Optional. UserProfile based on authentication method, necessary when a new user should be created.
   */
  profile?: ParsedProfile;
  /**
   * Promise that should resolve a unique existing user.
   */
  existingUser: Promise<User | null>;
  /**
   * Determines whether new users should be created automatically. Profile must also be present.
   *
   * - `true`: New users are created automatically from the Profile if they do not exist.
   * - `false`: New users must be created manually.
   */
  createNewUser: boolean;
};

type UpdatableUserFields = Pick<User, "microsoftGroupIds" | "tenants">;

export const upsertAuthUser = async ({
  payload,
  profile,
  allTenants = [],
  createNewUser,
  existingUser,
}: AuthenticateUserArgs) => {
  const tenantsPromise =
    Array.isArray(allTenants) && allTenants.length > 0
      ? Promise.resolve(allTenants)
      : getAllTenantsWithSecuritySelect(payload);

  let [tenants, user] = await Promise.all([tenantsPromise, existingUser]);
  if (!user && createNewUser && profile) {
    user = await createUserFromProfile(payload, profile).catch((error) => {
      payload.logger.error(
        { error, name: "upsertAuthUser" },
        "Failed to create User"
      );
      return null;
    });
  }
  if (!user) {
    return undefined;
  }
  user.microsoftGroupIds = await getPrincipalEntraGroupIds(user);
  const userTenants = getUserAllTenantsRoles({
    user: user,
    tenants,
  });
  const updateData: UpdatableUserFields = {
    tenants: userTenants,
    microsoftGroupIds: user.microsoftGroupIds || [],
  };
  user = await payload.update({
    id: user.id,
    depth: 1,
    collection: COLLECTION_SLUG_USERS,
    overrideAccess: true,
    data: updateData,
  });
  return user;
};
