import {
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SCOPES,
  OAUTH_BASE_URL,
} from "./config";
import { createLogoutTokenValidator } from "./tokens/features/logout/validateLogoutToken";
import { getOidcEndpointsForAuthority } from "./tokens/features/oauth_oidc_endpoints";
import { createRefreshTokenHandler } from "./tokens/features/refreshToken";
import { createRevokeTokenHandler } from "./tokens/features/revokeToken";
import { createAccessTokenValidator } from "./tokens/features/validateAccessToken";
import { createEndSessionHandler } from "./tokens/features/endSession";

/**
 * The Token Handler for the PKCE user flow
 */
const createTokenHandler = () => {
  const endpoints = getOidcEndpointsForAuthority(OAUTH_BASE_URL);
  const issuer = endpoints.issuer;
  const jwks_uri = endpoints.jwks_uri;
  const audience = OAUTH2_CLIENT_ID;

  const required_scopes = OAUTH2_CLIENT_SCOPES;

  const clientCredentials = {
    clientId: OAUTH2_CLIENT_ID,
    clientSecret: Promise.resolve(process.env.OAUTH2_CLIENT_SECRET!),
    scope: required_scopes.join(" "),
  };

  const allowed_jwt_algorithms = ["RS256", "ES384"];

  const refreshTokenAsync = createRefreshTokenHandler({
    token_endpoint: endpoints.token_endpoint,
    ...clientCredentials,
  });

  const revokeTokenAsync = createRevokeTokenHandler({
    revocation_endpoint: endpoints.revocation_endpoint,
    ...clientCredentials,
  });

  const validateLogoutToken = createLogoutTokenValidator({
    audience,
    issuer,
    allowed_jwt_algorithms,
    jwks_uri,
  });

  const validateAccessToken = createAccessTokenValidator({
    audience,
    issuer,
    allowed_jwt_algorithms,
    jwks_uri,
    client_id: clientCredentials.clientId,
    allowed_acrs: ["urn:se:curity:authentication:oidc:AzureAD"],
    required_scopes,
    recuired_claims: ["oid", "acr"],
  });

  const prepareEndSessionRequest = createEndSessionHandler({
    end_session_endpoint: endpoints.end_session_endpoint,
  });

  return {
    refreshTokenAsync,
    revokeTokenAsync,
    validateLogoutToken,
    validateAccessToken,
    prepareEndSessionRequest,
  };
};

export const userFlowTokenHandler = createTokenHandler();
