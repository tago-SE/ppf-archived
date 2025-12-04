import { COLLECTION_SLUG_SESSIONS } from "@/collections/config";
import { ensureAdapterSession } from "./ensureAdapterSession";
import { UpdateSessionResult } from "./types";
import { PayloadAdapterBaseQueryConfig } from "../types";

export async function createSession(
  input: { userId: string; sessionToken: string; expires: Date },
  { payload, logger }: PayloadAdapterBaseQueryConfig
): Promise<UpdateSessionResult> {
  const createdSession = await payload.create({
    collection: COLLECTION_SLUG_SESSIONS,
    data: {
      sessionToken: input.sessionToken,
      user: input.userId,
      expires: input.expires.toISOString(),
    },
  });
  logger?.info("createSession", {
    sessionToken: input.sessionToken,
    userId: input.userId,
  });
  return ensureAdapterSession(createdSession);
}
