import type { AdapterSession } from "next-auth/adapters";
import type { Session } from "@/payload-types";
import { SESSION_MAX_AGE_SECONDS } from "../../config";

const defaultMaxAge = SESSION_MAX_AGE_SECONDS;

/**
 * Parses a payload session to a NextAuth session object
 */
export const ensureAdapterSession = (session: Session): AdapterSession => {
  if (!session.expires) {
    throw new Error("Expires missing.");
  }
  const userId =
    typeof session?.user === "string" ? session?.user : session?.user?.id;
  return {
    sessionToken: session.sessionToken,
    userId: userId,
    expires: session?.expires
      ? new Date(session.expires)
      : new Date(Date.now() + defaultMaxAge * 1000),
  };
};
