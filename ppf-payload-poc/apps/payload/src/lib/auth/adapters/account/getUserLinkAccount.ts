import { User } from "@/payload-types";
import { AdapterAccount } from "next-auth/adapters";
import { PayloadAdapterQueryConfigWithOptions } from "../types";
import { getUserById } from "../user";
import { toAdapterAccount } from "./toAdapterAccount";

export function extractUserLinkAccount(user?: User) {
  if (!user) {
    return null;
  }
  if (!!user.accounts && user.accounts.length === 1) {
    return toAdapterAccount(user, user.accounts![0] as AdapterAccount);
  }
  const foundAccount = user?.accounts?.find(
    (x) =>
      user.linkAccount?.provider == x.provider &&
      user.linkAccount?.providerAccountId == x.providerAccountId
  );
  return toAdapterAccount(user, foundAccount as AdapterAccount);
}

/**
 * Retrieves the account defined by user.linkAccount or the first account if only one is present.
 *
 * - The function checks foor (`user.linkAccount`). If a linked account exists.
 *
 * - If the user only has one account, that account will be returned based on (`user.accounts[0]`).
 *
 * - If multiple accounts are present the function attempts to find a matching account based on the `provider` and `providerAccountId` from `user.linkAccount`.
 *
 * @param payload
 * @param userId
 * @returns
 */
export async function getUserLinkAccount(
  userId: string,
  { payload }: PayloadAdapterQueryConfigWithOptions
) {
  if (!userId) return null;
  const user = await getUserById(userId, {
    payload,
    options: { showHiddenFields: true },
  });
  return extractUserLinkAccount(user!);
}
