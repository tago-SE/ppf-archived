import { User } from "@/payload-types";
import { PayloadAdapterQueryConfigWithOptions } from "../types";
import { Where } from "payload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";

export async function getUsersByClaims(
  claims: Partial<Pick<User, "oid" | "sub" | "email" | "username" | "name">>,
  {
    payload,
    options,
    logic = "or",
  }: PayloadAdapterQueryConfigWithOptions & { logic?: "or" | "and" }
) {
  const operator = logic;
  const query: Where = { [logic]: [] };

  for (const [key, value] of Object.entries(claims)) {
    if (typeof value === "string" || typeof value === "number") {
      query[operator]!.push({
        [key]: {
          equals: value,
        },
      } as Where);
    }
  }
  if (query[operator]?.length === 0) {
    return [];
  }
  const { docs: users } = await payload.find({
    collection: COLLECTION_SLUG_USERS,
    depth: 1,
    disableErrors: true,
    showHiddenFields: !!options?.showHiddenFields,
    where: query,
  });
  return users ?? [];
}
