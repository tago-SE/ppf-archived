import type { JWTPayload } from "jose";

export type LogoutTokenClaims = JWTPayload & {
  /**
   * JWT ID (jti): A unique identifier for the token, used to prevent token replay attacks.
   */
  jti: string;
  /**
   * Issuer (iss): Identifies the principal that issued the token.
   */
  iss: string;
  /**
   * Subject (sub): Identifies the principal that is the subject of the token. Often a user or entity ID.
   */
  sub: string;
  /**
   * Audience (aud): Identifies the recipients that the token is intended for.
   */
  aud: string;
  /**
   * Issued At (iat): The time at which the token was issued, represented as a Unix timestamp (seconds since Epoch).
   */
  iat: number;
  /**
   * Expiration Time (exp): The time at which the token expires, represented as a Unix timestamp (seconds since Epoch).
   */
  exp: number;
  /**
   * Purpose: Indicates the specific purpose of the token. For logout tokens, this is fixed to "logout".
   */
  purpose: "logout";
  /**
   * Session ID (sid): A unique identifier for the session, allowing the IDP to correlate the token with a user session.
   */
  sid: string;
  /**
   * Events: Contains logout event information as defined by the logout protocol.
   */
  events: { [key: string]: object };
};
