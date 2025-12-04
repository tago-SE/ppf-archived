import { COLLECTION_SLUG_SESSIONS } from "@/collections/config";
import { ensureAdapterSession } from "./ensureAdapterSession";
import { ensureAdapterUser } from "../user/ensureAdapterUser";
import { GetSessionAndUserResult } from "./types";
import { PayloadAdapterBaseQueryConfig } from "../types";

/**
 * Delete all sessions matching the passed sessionToken.
 *
 * @param payload
 * @param args
 * @returns deleted matching session or null if nothing was deleted.
 */
export async function getSessionAndUser(
  sessionToken: string,
  { payload, logger }: PayloadAdapterBaseQueryConfig
): Promise<GetSessionAndUserResult> {
  if (!sessionToken) {
    return null;
  }
  const { docs: sessions } = await payload.find({
    collection: COLLECTION_SLUG_SESSIONS,
    depth: 1,
    where: { sessionToken: { equals: sessionToken } },
  });
  const session = sessions.at(0);
  if (!session || !session.user || typeof session.user !== "object") {
    logger?.warn("getSessionAndUser:404", {
      sessionToken: sessionToken,
    });
    return null;
  }
  logger?.info("getSessionAndUser:200", {
    sessionToken: sessionToken,
  });
  return {
    session: ensureAdapterSession(session),
    user: ensureAdapterUser(session.user), // This is currently returning tenants and msgraph we may want to modify this in the mapper
  };
}
