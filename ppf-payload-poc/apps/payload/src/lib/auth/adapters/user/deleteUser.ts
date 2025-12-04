import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { User } from "@/payload-types";
import { PayloadAdapterBaseQueryConfig } from "../types";

export async function deleteUserById(
  userId: string,
  { payload }: Omit<PayloadAdapterBaseQueryConfig, "logger">
): Promise<User | null> {
  const payloadUser = await payload.delete({
    collection: COLLECTION_SLUG_USERS,
    id: userId,
  });
  return payloadUser;
}
