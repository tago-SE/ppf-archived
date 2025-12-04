import { COLLECTION_SLUG_SESSIONS } from "@/collections/config";
import { ensureAdapterSession } from "./ensureAdapterSession";
import type { AdapterSession } from "next-auth/adapters";
import { UpdateSessionResult } from "./types";
import { PayloadAdapterBaseQueryConfig } from "../types";

/**
 * Update the expiration time of the session
 *
 * @param payload
 * @param args
 * @returns
 */
export async function updateSession(
  session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">,
  { payload, logger }: PayloadAdapterBaseQueryConfig
): Promise<UpdateSessionResult> {
  if (!session || !session.expires || !session.sessionToken) {
    return null;
  }
  const data = {
    expires: session.expires.toISOString(),
  };
  const { docs: sessions } = await payload.update({
    collection: COLLECTION_SLUG_SESSIONS,

    where: {
      sessionToken: {
        equals: session.sessionToken,
      },
    },
    data: data,
  });
  const updatedSession = sessions.at(0);
  if (!updatedSession) {
    logger?.warn("updateSession:404", session);
    return null;
  }
  const parsed = ensureAdapterSession(updatedSession);
  logger?.info("updateSession:200", parsed);
  return parsed;
}
