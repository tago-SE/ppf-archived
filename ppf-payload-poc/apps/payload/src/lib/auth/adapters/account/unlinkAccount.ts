import Logger from "@/lib/logging";
import { Adapter } from "next-auth/adapters";
import { Payload } from "payload";
import { getUserByAccount } from "../user";
import { COLLECTION_SLUG_USERS } from "@/collections/config";

/**
 * Unlinks a account.
 
 * @param payload
 * @param logger
 * @returns
 */
export const createUnlinkAccount = (
  payload: Payload,
  logger?: Logger
): Adapter["unlinkAccount"] => {
  return async ({ providerAccountId, provider }) => {
    const user = await getUserByAccount(
      {
        provider,
        providerAccountId,
      },
      { payload }
    );
    if (!user || !Array.isArray(user?.accounts)) {
      return;
    }
    const updatedAccounts = user.accounts.filter(
      (account) =>
        account.provider !== provider ||
        account.providerAccountId !== providerAccountId
    );
    logger?.info("unlinkAccount", {
      userId: user.id,
      provider,
      providerAccountId,
    });
    await payload.update({
      collection: COLLECTION_SLUG_USERS,
      id: user.id,
      data: {
        accounts: updatedAccounts,
      },
    });
  };
};
