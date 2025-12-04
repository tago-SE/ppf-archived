import { z } from "zod";
import { ClientCredentials } from "./clientCredentials";

const TOKEN_EXPIRY_OFFSET = 10; // Offset in seconds

type RefreshTokenConfig = ClientCredentials & {
  /**
   * Example:
   *
   * {issuer}/oauth/v2/oauth-token
   */
  token_endpoint: URL | string;
  /**
   * Token expiery offset default the expires_at will be offset by 10 seconds.
   */
  tokenExpieryOffset?: number;
};

type RefreshTokenClaims = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: "bearer" | "dpop" | string;
  expires_in: number;
  expires_at: number;
};

function createRefreshTokenClaims(
  body: RefreshTokenClaims,
  tokenExpieryOffset: number
): RefreshTokenClaims {
  const schema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.enum(["bearer", "dpop"]),
    scope: z.string(),
    expires_in: z.number(),
    expires_at: z.number(),
  }) satisfies z.ZodSchema<RefreshTokenClaims>;
  return schema.parse({
    ...body,
    expires_at:
      Math.floor(Date.now() / 1000) +
      body.expires_in -
      (tokenExpieryOffset < 0 ? 0 : tokenExpieryOffset),
  });
}

type FetchTokenResult = {
  token: RefreshTokenClaims | undefined;
  success: boolean;
  error?: unknown;
};

export type RefreshTokenFn = (
  refreh_token: string
) => Promise<FetchTokenResult>;

export function createRefreshTokenHandler({
  token_endpoint,
  clientId,
  clientSecret,
  scope,
  tokenExpieryOffset = TOKEN_EXPIRY_OFFSET,
}: RefreshTokenConfig): RefreshTokenFn {
  const handler: RefreshTokenFn = async (
    refresh_token
  ): Promise<FetchTokenResult> => {
    try {
      const res = await fetch(token_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: await Promise.resolve(clientSecret),
          grant_type: "refresh_token",
          refresh_token,
          scope: scope,
        }).toString(),
      });
      if (!res.ok) {
        const { error, error_description } = await res.json();
        throw new Error(`[${res.statusText}] ${error} - ${error_description}`);
      }
      const body = await res.json();
      console.info(`RefreshToken:result [${res.status}]`);
      return {
        token: createRefreshTokenClaims(body, tokenExpieryOffset),
        success: true,
      };
    } catch (error) {
      console.error("RefreshTokenError", error);
      return { token: undefined, success: false, error };
    }
  };
  return handler;
}
