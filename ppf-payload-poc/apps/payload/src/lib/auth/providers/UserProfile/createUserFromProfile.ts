import { Payload } from "payload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { ParsedProfile } from "@/lib/auth/providers/parseClaimsToUser";

export function createUserFromProfile(
  payload: Payload,
  profile: ParsedProfile
) {
  const { id, ...profileWithoutId } = profile;
  return payload.create({
    collection: COLLECTION_SLUG_USERS,
    overrideAccess: true,
    data: profileWithoutId,
  });
}
