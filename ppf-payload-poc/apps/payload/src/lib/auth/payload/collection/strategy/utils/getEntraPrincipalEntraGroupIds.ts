import { MSGraphService } from "@/lib/msgraph";
import type { User } from "@payload-types";
import { UserPrincipalTypes } from "@/collections/Users/userPrincipalTypes";

export async function getPrincipalEntraGroupIds(
  user: Pick<User, "principalType" | "oid" | "sub">
) {
  if (!user.principalType) {
    throw new Error("Missing principalType");
  }
  if (user.principalType === UserPrincipalTypes.EntraUser) {
    return (await MSGraphService.getUserGroups(user.oid)).map(
      (g) => g.objectId
    );
  }
  if (user.principalType === UserPrincipalTypes.EntraServicePrincipal) {
    return (await MSGraphService.getServicePrincipalGroups(user.sub!)).map(
      (g) => g.objectId
    );
  }
  return [];
}
