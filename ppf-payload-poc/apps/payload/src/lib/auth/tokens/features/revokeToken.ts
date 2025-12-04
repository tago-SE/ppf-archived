import { ClientCredentials } from "./clientCredentials";

type RevokeTokenConfig = ClientCredentials & {
  /**
   * Example:
   *  {issuer}/oauth/v2/oauth-revoke
   */
  revocation_endpoint: URL | string;
};

type TokenKindType = "access_token" | "id_token" | "refresh_token";

export type RevokeTokenFn = (
  token: string,
  tokenKind: TokenKindType
) => Promise<boolean>;

export function createRevokeTokenHandler({
  revocation_endpoint,
  clientId,
  clientSecret,
  scope,
}: RevokeTokenConfig): RevokeTokenFn {
  const handler = async (
    token: string,
    tokenKind: TokenKindType
  ): Promise<boolean> => {
    if (!token) {
      return false;
    }
    const url = new URL(revocation_endpoint);
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: await Promise.resolve(clientSecret),
      token: token,
      scope: scope,
    });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      return res.ok;
    } catch (error) {
      console.error("RevokeTokenError", error);
      return false;
    }
  };
  return handler;
}
