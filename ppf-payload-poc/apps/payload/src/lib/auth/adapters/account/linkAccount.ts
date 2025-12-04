import { COLLECTION_SLUG_USERS } from "@/collections/config";
import Logger from "@/lib/logging";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { Payload } from "payload";
import { z } from "zod";
import { User } from "@/payload-types";
import { toAdapterAccount } from "./toAdapterAccount";
import { updateAccountSchema } from "./validationSchemas";

function getCurrentLoginDetails(
  account: AdapterAccount,
  payloadUser: User
): Pick<User, "linkAccount">["linkAccount"] {
  if (!!account.id_token) {
    return {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    };
  }
  if (payloadUser.linkAccount?.provider) {
    return payloadUser.linkAccount;
  }
  return {
    provider: account.provider,
    providerAccountId: account.providerAccountId,
  };
}

export const createLinkAccount = (
  payload: Payload,
  logger?: Logger
): Adapter["linkAccount"] => {
  return async (input) => {
    const account = updateAccountSchema.parse(input);
    const payloadUser: User | null = await payload.findByID({
      collection: COLLECTION_SLUG_USERS,
      disableErrors: true,
      showHiddenFields: true,
      id: account.userId,
    });
    if (!payloadUser) {
      throw new Error(
        `Failed to link account: User.userId'${account.userId}' not found`
      );
    }
    const accountAlreadyExists =
      payloadUser.accounts?.findIndex(
        (x) =>
          x.provider == account.provider &&
          x.providerAccountId == account.providerAccountId
      ) !== -1;
    const accounts = accountAlreadyExists
      ? payloadUser.accounts!.map((itr) => {
          if (
            itr.provider === account.provider &&
            itr.providerAccountId === account.providerAccountId
          ) {
            return account;
          }
          return itr;
        })
      : [...(payloadUser.accounts || []), account];

    const linkAccount = getCurrentLoginDetails(account, payloadUser);

    const data = {
      linkAccount: linkAccount,
      accounts: accounts,
    } as Pick<User, "accounts" | "linkAccount">;
    const updatedUser = await payload.update({
      collection: COLLECTION_SLUG_USERS,
      id: account.userId,
      data: data,
    });
    logger?.info("linkAccount", {
      userId: updatedUser?.id,
      accountAlreadyExists: accountAlreadyExists,
      account: `${account.provider}:${account.providerAccountId}`,
    });
    return toAdapterAccount(updatedUser, account);
  };
};
