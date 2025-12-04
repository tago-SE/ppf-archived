import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { PayloadAdapterQueryConfigWithOptions, User } from "../types";

type Args = {
  providerAccountId: string;
  provider: string;
};

export async function getUserByAccount(
  { providerAccountId, provider }: Args,
  { payload, options }: PayloadAdapterQueryConfigWithOptions
): Promise<User | null> {
  const { docs: users } = await payload.find({
    collection: COLLECTION_SLUG_USERS,
    depth: 1,
    showHiddenFields: !!options?.showHiddenFields,
    disableErrors: true,
    where: {
      "accounts.provider": { equals: provider },
      "accounts.providerAccountId": { equals: providerAccountId },
    },
  });
  if (users.length > 1) {
    throw new Error("Failed to resolve unique user.");
  }
  return users.at(0) ?? null;
}
