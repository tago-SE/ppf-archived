import type {
  AuthStrategy,
  AuthStrategyFunction,
  User as PayloadUser,
} from "payload";
import { User } from "@/payload-types";
import { createAuthenticationResponseHeader } from "./utils/authResponseHeaders";
import { validateAuthorizationHeader } from "./utils/validateAuthorizationHeader";
import { upsertAuthUser } from "./utils/upsertAuthUser";
import { validateEntraIdToken } from "@/lib/auth/tokens/entraid/validateEntraIdClaims";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import { azureActiveDirectoryAccessTokenToUser } from "@/lib/auth/providers/parseClaimsToUser";
import { gettUsersByClaims } from "@/lib/auth/adapters/user";
import { filterObjectKeys } from "../../utils/filterObjectKeys";
import { handleHeaderTenants } from "./utils/handleHeaderTenants";
import {
  handleTokenValidationError,
  handleUnresolvedUser,
} from "./utils/handlers";

export const authStrategyName = "ext-user";
const authSchema = "Bearer" as const;
const authorizationHeader = "Authorization";
const excludedFields: (keyof User)[] = ["curityClient", "verificationTokens"];

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
    const { result } = await validateAuthorizationHeader({
      payload,
      headers,
      responseHeaders,
      strategyName,
      authSchema,
      authorizationHeader,
      claimToProfile: azureActiveDirectoryAccessTokenToUser,
      validateToken: (access_token: string) =>
        validateEntraIdToken(access_token, "user"),
    });
    if (!result.user) {
      return result;
    }
    const profile = result.user!;
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
    const existingUser = gettUsersByClaims(
      { oid: profile.oid },
      { payload, options: { showHiddenFields: false } }
    ).then((users) => users.at(0) ?? null);

    const payloadUser = await withNodeCache(
      () =>
        upsertAuthUser({
          payload,
          profile: profile,
          createNewUser: true,
          allTenants: allTenants,
          existingUser: existingUser,
        }),
      [strategyName, profile.oid],
      {
        revalidate: 10,
      }
    )();
    if (!payloadUser) {
      return { user: null };
    }

    const filteredUser = filterObjectKeys(payloadUser, excludedFields);
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
 * This authenticate strategy assumes that the user is a registrated user
 *
 * @confluence https://confluence.ifint.biz/spaces/partnerportalframework/pages/341152567/Authentication#Authentication-ServicePrincipalAuthentication
 */
export const externalEntraUserStrategy: AuthStrategy = {
  name: authStrategyName,
  authenticate: handler,
};
