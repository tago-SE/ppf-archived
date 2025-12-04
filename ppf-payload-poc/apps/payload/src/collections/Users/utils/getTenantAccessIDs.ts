import type { ClientUser, TypedUser } from "payload";
/**
 * Returns all tenant ids that the user has access to in any way.
 */
export function getUserTenantAccessIds(user: Omit<TypedUser, "collection">): string[] {
  if (!user) {
    return [];
  }
  return (
    user?.tenants?.reduce((acc: string[], { tenant }) => {
      if (tenant) {
        acc.push(typeof tenant === "string" ? tenant : tenant.id);
      }
      return acc;
    }, []) || []
  );
}

/**
 * TODO: Need Fix
 *
 * @deprecated I don't know how this was intended to be used abd ut seen to have been removed, we can now re-add it if we wanted but leaving it as deprecated
 * @param user
 * @returns
 */
export function getTenantAdminTenantAccessIds(
  user: null | ClientUser
): string[] {
  if (!user) {
    return [];
  }
  return [];
  // return (
  //   user?.tenants?.reduce((acc: string[], { roles, tenant }) => {
  //     if (roles.includes("tenant-admin") && tenant) {
  //       acc.push(typeof tenant === "string" ? tenant : tenant.id);
  //     }
  //     return acc;
  //   }, []) || []
  // );
}
