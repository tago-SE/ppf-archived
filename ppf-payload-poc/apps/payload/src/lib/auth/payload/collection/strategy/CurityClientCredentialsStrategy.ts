import type {
  AuthStrategy,
  AuthStrategyFunction,
  User as PayloadUser,
} from "payload";
import { extractBearerTokenWithResponseHeader } from "./utils/validateAuthorizationHeader";
import { createAccessTokenValidator } from "@/lib/auth/tokens/features/validateAccessToken";
import { getOidcEndpointsForAuthority } from "@/lib/auth/tokens/features/oauth_oidc_endpoints";
import { getLoadedRemoteJWKSet } from "@/lib/auth/tokens/features/getLoadedJWKSet";
import { CurityClientAccessTokenClaims } from "@/lib/auth/tokens/curityClaims";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import { getTenantPermissions } from "@/collections/Tenants/service/getTenantPermissions";
import { CuritySystemFlowAuthN, User } from "@/payload-types";
import { upsertAuthUser } from "./utils/upsertAuthUser";
import { createAuthenticationResponseHeader } from "./utils/authResponseHeaders";
import { curityClientCredentialToUser } from "@/lib/auth/providers/parseClaimsToUser";
import { gettUsersByClaims } from "@/lib/auth/adapters/user";
import { filterObjectKeys } from "../../utils/filterObjectKeys";
import { handleHeaderTenants } from "./utils/handleHeaderTenants";
import {
  handleTokenValidationError,
  handleUnresolvedUser,
} from "./utils/handlers";

export const authStrategyName = "curity-client";
const authSchema = "Bearer";
const authorizationHeader = "Authorization";

export const curityClientCredentialsExcludedFields: (keyof User)[] = [
  "linkAccount",
  "accounts",
  "verificationTokens",
  "emailVerified",
  "microsoftGroupIds",
  "image",
  "name",
];

const validateClientToken = async (
  client: CuritySystemFlowAuthN,
  token: string
) => {
  if (!client) throw new Error("Client is null");
  const issuer = client.iss!;
  const endpoints = getOidcEndpointsForAuthority(issuer);
  const jwks_uri = endpoints.jwks_uri;
  const jwks = await getLoadedRemoteJWKSet(issuer);
  const allowed_jwt_algorithms = jwks.jwks()!.keys.map((key) => key.alg!);
  const input = {
    audience: client.aud ?? client.clientId!,
    client_id: client.clientId!,
    issuer,
    allowed_jwt_algorithms,
    jwks_uri,
    required_scopes: client.scopes || [],
  };
  const validator = createAccessTokenValidator(input);
  const claims = await validator(token);
  return claims as CurityClientAccessTokenClaims;
};

const handler: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName = authStrategyName,
}) => {
  let responseHeaders = createAuthenticationResponseHeader({
    requestHeaders: headers,
  });
  try {
    const { token } = extractBearerTokenWithResponseHeader({
      headers,
      authSchema: authSchema,
      authorizationHeader: authorizationHeader,
      responseHeaders,
    });
    if (!token) {
      return handleUnresolvedUser({
        payload,
        strategyName,
        responseHeaders,
        logMessage: `Invalid ${authSchema} token`,
      });
    }
    const { allTenants, headerTenant } = await handleHeaderTenants({
      payload,
      headers,
      responseHeaders,
    });
    if (!headerTenant) {
      return handleUnresolvedUser({
        payload,
        strategyName,
        responseHeaders,
        logMessage: "Tenant not found",
      });
    }
    const permissions = getTenantPermissions(headerTenant);
    const curityClient = permissions.authentication.curityClient;
    if (!curityClient || curityClient.length === 0) {
      return {
        user: null,
        responseHeaders,
      };
    }
    const { success, claims, error } = await Promise.any(
      curityClient.map((client) => validateClientToken(client, token))
    )
      .then((jwt) => ({
        claims: jwt as CurityClientAccessTokenClaims,
        success: true,
        error: undefined,
      }))
      .catch((error: AggregateError) => {
        return { success: false, claims: undefined, error };
      });

    if (!success) {
      return handleTokenValidationError({
        payload,
        responseHeaders,
        strategyName,
        authSchema,
        error: error!,
      });
    }

    // Extract Profile from Claims
    const profile = curityClientCredentialToUser(claims!);

    const existingUser = gettUsersByClaims(
      { sub: profile.sub },
      { payload, options: { showHiddenFields: false } }
    ).then((users) => users.at(0) || null);

    // Update DB User
    const payloadUser = await withNodeCache(
      () =>
        upsertAuthUser({
          payload,
          profile,
          createNewUser: true,
          allTenants,
          existingUser,
        }),
      [strategyName, profile.sub!, claims?.client_id!, claims!.iss],
      {
        revalidate: 10,
      }
    )();
    if (!payloadUser) {
      return {
        user: null,
        responseHeaders,
      };
    }
    const filteredUser = filterObjectKeys(
      payloadUser!,
      curityClientCredentialsExcludedFields
    );
    return {
      user: {
        _strategy: strategyName,
        collection: payload.collections.user.config.slug,
        ...filteredUser,
      } as PayloadUser,
    };
  } catch (error) {
    return handleTokenValidationError({
      payload,
      responseHeaders,
      authSchema,
      strategyName,
      error,
    });
  }
};

/**
 * Curity ClientCredentials Authentication
 *
 * @confluence https://confluence.ifint.biz/spaces/partnerportalframework/pages/341152567/Authentication#Authentication-ServicePrincipalAuthentication
 */
export const curityClientCredentialsStrategy: AuthStrategy = {
  name: authStrategyName,
  authenticate: handler,
};
