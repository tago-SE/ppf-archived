import { COLLECTION_SLUG_SESSIONS } from "@/collections/config";
import { ensureAdapterSession } from "./ensureAdapterSession";
import { DeleteSessionResult } from "./types";
import { PayloadAdapterBaseQueryConfig } from "../types";

/**
 * Delete all sessions matching the passed sessionToken. Returns null if there was nothing to delete.
 *
 * @param payload
 * @param args
 * @returns deleted matching session or null if nothing was deleted.
 */
export async function deleteSession(
  sessionToken: string,
  { payload, logger }: PayloadAdapterBaseQueryConfig
): Promise<DeleteSessionResult> {
  if (!sessionToken) {
    return null;
  }
  const { docs: sessions } = await payload.delete({
    collection: COLLECTION_SLUG_SESSIONS,
    where: {
      sessionToken: {
        equals: sessionToken,
      },
    },
  });
  const deletedSession = sessions.at(0) || null;
  if (!!deletedSession) {
    const parsed = ensureAdapterSession(deletedSession);
    logger?.info("deleteSession:OK", {
      sessionToken: sessionToken,
      deletedCount: sessions.length,
    });
    return parsed;
  }
  return null;
}
