import type { Session, NextAuthConfig } from "next-auth";
import { Adapter, AdapterSession } from "next-auth/adapters";
import Logger from "@/lib/logging";
import { JWTExpired } from "jose/errors";
import { SessionError } from "../next-auth";
import { userFlowTokenHandler } from "../userFlowTokenHandler";
import { validateAccountModelThrows } from "../adapters/account/validationSchemas";
import { z } from "zod";
import { User } from "@/payload-types";
import type { JWTPayload } from "jose";
import { userTypesThatCanSignIn } from "@/collections/Users/userPrincipalTypes";

interface SessionHandlerConfig {
  adapter: Adapter;
  logger?: Logger;
}

function handleEmptySession(session: Session) {
  return { ...session, user: undefined };
}

function handleInvalidSession(session: Session, error: SessionError) {
  return {
    ...session,
    user: null,
    error,
  } as unknown;
}

type ValidSession = {
  session: Pick<AdapterSession, "expires" | "sessionToken" | "userId">;
  user: Pick<
    User,
    "id" | "sub" | "oid" | "email" | "linkAccount" | "principalType"
  > | null;
  /**
   * Token expiration time in seconds.
   */
  exp?: number;
};

/**
 * Removes fields from the principal object
 */
const validateSession = z.object({
  session: z.object({
    userId: z.string(),
    sessionToken: z.string(),
    expires: z.date(),
  }),
  exp: z.number().optional(),
  user: z.object({
    id: z.string(),
    sub: z.string(),
    oid: z.string(),
    email: z.string(),
    username: z.string(),
    principalType: z.enum(userTypesThatCanSignIn),
    linkAccount: z.object({
      provider: z.string(),
      providerAccountId: z.string(),
      expires_at: z.string().optional(),
    }),
  }),
}) satisfies z.ZodSchema<ValidSession>;

function handleValidSession(
  session: AdapterSession & Session,
  claims: JWTPayload
) {
  const parsed = {
    session: {
      sessionToken: session.sessionToken,
      expires: session.expires,
      userId: session.userId,
    },
    exp: claims.exp,
    user: {
      ...session.user,
    },
  };
  return validateSession.parse(parsed) as any;
}

export const createSessionHandler = ({
  adapter,
  logger,
}: SessionHandlerConfig) => {
  /**
   * NOTES:
   *
   * Session.expires - The absolute date when the session expires.
   *
   * 1) Sessions are extended when touched based on `maxAge` option in SessionOptions.
   *
   * 2) It is never extended more than once in a period defined by `SessionOptions.updateAge`.
   *
   * 3) If a session is accessed past its expiry date, it will be removed from the database.
   *
   */
  return {
    async session({ session, token, user, newSession, trigger }) {
      if (!session || !session.user) {
        return handleEmptySession(session);
      }
      const pid = crypto.randomUUID();
      const sessionToken = session.sessionToken;
      try {
        const foundAccount = await adapter.getUserLinkAccount(session.userId);
        const account = validateAccountModelThrows(foundAccount);
        const claims = await userFlowTokenHandler.validateAccessToken(
          account.access_token
        );
        return handleValidSession(session, claims);
      } catch (error) {
        if (error instanceof JWTExpired) {
          return handleInvalidSession(session, {
            code: error.code,
            message: error.message,
            pid: pid,
          });
        }
        logger?.error(`session error occured`, { pid, sessionToken });
        logger?.error("sesion error details", error);
      }
      return handleInvalidSession(session, {
        code: "ERR_UNKNOWN",
        pid: pid,
      });
    },
  } satisfies Pick<NextAuthConfig, "callbacks">["callbacks"];
};
