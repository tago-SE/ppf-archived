import { getUserById } from "../user";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { PayloadAdapterQueryConfigWithOptions } from "../types";
import { extractUserLinkAccount } from "./getUserLinkAccount";

type Args = {
  userId: string;
  tokens: {
    refresh_token?: boolean;
    access_token?: boolean;
    id_token?: boolean;
  };
};
/**
 * Clears the specified tokens which match the account found in (`user.linkAccount`).
 */
export async function clearAccountTokens(
  { userId, tokens }: Args,
  { payload }: PayloadAdapterQueryConfigWithOptions
): Promise<boolean> {
  const user = await getUserById(userId, {
    payload,
    options: { showHiddenFields: true },
  });
  let foundAccount = extractUserLinkAccount(user!);
  if (!user || !foundAccount || !Array.isArray(user?.accounts)) {
    return false;
  }
  const updatedAccounts = user.accounts.map((x) => {
    if (
      x.provider === foundAccount.provider &&
      x.providerAccountId === foundAccount.providerAccountId
    ) {
      if (tokens.access_token) {
        x.access_token = null;
      }
      if (tokens.refresh_token) {
        x.refresh_token = null;
      }
      if (tokens.id_token) {
        x.id_token = null;
      }
    }
    return x;
  });
  await payload.update({
    collection: COLLECTION_SLUG_USERS,
    id: user.id,
    data: {
      accounts: updatedAccounts,
    },
  });
  return true;
}
