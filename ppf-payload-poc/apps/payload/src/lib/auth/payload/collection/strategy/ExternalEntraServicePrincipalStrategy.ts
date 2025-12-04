import type {
  AuthStrategy,
  AuthStrategyFunction,
  User as PayloadUser,
} from "payload";
import { createAuthenticationResponseHeader } from "./utils/authResponseHeaders";
import {
  handleTokenValidationError,
  handleUnresolvedUser,
} from "./utils/handlers";
import { handleHeaderTenants } from "./utils/handleHeaderTenants";
import { azureActiveDirectoryAccessTokenToUser } from "@/lib/auth/providers/parseClaimsToUser";
import { getTenantPermissions } from "@/collections/Tenants/service/getTenantPermissions";
import { User } from "@/payload-types";
import { gettUsersByClaims } from "@/lib/auth/adapters/user";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import { upsertAuthUser } from "./utils/upsertAuthUser";
import { filterObjectKeys } from "../../utils/filterObjectKeys";
import { extractBearerTokenWithResponseHeader } from "./utils/validateAuthorizationHeader";
import {
  AzureManagedIdentityAppClaims,
  jwtVerifyAnyEntraServicePrincipalThrows,
  type JWTVerifyEntraServicePrincipalOptions,
} from "@/lib/auth/tokens/entraid";

const authStrategyName = "ext-entra-service";
const authSchema = "Bearer";
const authorizationHeader = "Authorization";

// TODO: Ideally this should be moved to where the profile is configured ..?
const excludedFields: (keyof User)[] = [
  "curityClient",
  "verificationTokens",
  "accounts",
  "image",
  "linkAccount",
  "name",
];

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
    const clients = permissions.authentication.servicePrincipal;
    if (!clients || clients.length === 0) {
      return {
        user: null,
        responseHeaders,
      };
    }
    const manyVerifyOptions = clients.map((client) => {
      const option: JWTVerifyEntraServicePrincipalOptions = {
        tid: client.tid,
        principalId: client.objectId,
        clientId: client.clientId,
        issuer: client.iss!,
        audience: client.aud as "https://management.azure.com",
        requiredClaims: client.requiredClaims!,
      };
      return option;
    });
    const { success, claims, error } =
      await jwtVerifyAnyEntraServicePrincipalThrows(token, manyVerifyOptions)
        .then((jwt) => ({
          claims: jwt as AzureManagedIdentityAppClaims,
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
    const profile = azureActiveDirectoryAccessTokenToUser(claims!);
    const existingUser = gettUsersByClaims(
      { oid: profile.oid },
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
      [strategyName, profile.oid!],
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
    const filteredUser = filterObjectKeys(payloadUser!, excludedFields);
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
      authSchema,
      strategyName,
      error,
      responseHeaders,
    });
  }
};

/**
 * Entra ServicePrincipal Authentication
 *
 * @confluence https://confluence.ifint.biz/spaces/partnerportalframework/pages/341152567/Authentication#Authentication-ServicePrincipalAuthentication
 */
export const externalEntraServiceStrategy: AuthStrategy = {
  name: authStrategyName,
  authenticate: handler,
};
