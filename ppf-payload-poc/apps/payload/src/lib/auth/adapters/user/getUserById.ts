import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { User } from "@/payload-types";
import { Payload, Where } from "payload";

type QueryOptions = { showHiddenFields?: boolean };
type Config = { payload: Payload; options?: QueryOptions };

export async function getUserById(
  id: string,
  { payload, options }: Config
): Promise<User | null> {
  return await payload.findByID({
    collection: COLLECTION_SLUG_USERS,
    disableErrors: true,
    showHiddenFields: !!options?.showHiddenFields,
    id,
  });
}
