import { ParsedProfile } from "@/lib/auth/providers/parseClaimsToUser";
import {
  AzureManagedIdentityAppClaims,
  EntraIDUserClaims,
} from "@/lib/auth/tokens/entraid/EntraIdClaims";
import { JWTPayload } from "jose";
import { Payload } from "payload";
import { handleTokenValidationError, handleUnresolvedUser } from "./handlers";

type ExtractBearerTokenArgs = {
  headers: Headers;
  authSchema: string;
  authorizationHeader: string;
  responseHeaders: Headers;
};

class AuthenticationError extends Error {
  constructor(
    public scheme: string,
    public code: "invalid_scheme" | "invalid_token",
    public description: string
  ) {
    super(description);
    this.name = "AuthenticationError";
  }
}

export function extractBearerToken({
  headers,
  authSchema,
  authorizationHeader,
}: Omit<ExtractBearerTokenArgs, "responseHeaders">): string {
  const authorization = headers.get(authorizationHeader) ?? "";
  const [parsedSchema, token] = authorization.split(" ");
  if (
    !parsedSchema ||
    parsedSchema.toLowerCase() !== authSchema.toLowerCase()
  ) {
    throw new AuthenticationError(
      authSchema,
      "invalid_scheme",
      `Invalid authentication scheme. Expected ${authSchema}`
    );
  }

  if (!token) {
    throw new AuthenticationError(
      authSchema,
      "invalid_token",
      "Token is missing or invalid"
    );
  }
  return token.trim();
}

export function extractBearerTokenWithResponseHeader(
  args: ExtractBearerTokenArgs
): { token: string | undefined } {
  try {
    return { token: extractBearerToken(args) };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      args.responseHeaders.append(
        "WWW-Authenticate",
        `${error.scheme} realm="example", error="${error.code}", error_description="${error.description}"`
      );
    }
    return { token: undefined };
  }
}

type ClaimTypes = EntraIDUserClaims | AzureManagedIdentityAppClaims;

type HandleAuthorizationToken = {
  payload: Payload;
  headers: Headers;
  authSchema: string;
  authorizationHeader: string;
  responseHeaders: Headers;
  strategyName: string;
  validateToken: (access_token: string) => Promise<JWTPayload>;
  claimToProfile: (claims: ClaimTypes) => ParsedProfile;
};

export const validateAuthorizationHeader = async ({
  payload,
  headers,
  authSchema,
  strategyName,
  authorizationHeader,
  responseHeaders,
  validateToken,
  claimToProfile,
}: HandleAuthorizationToken) => {
  const { token } = extractBearerTokenWithResponseHeader({
    headers,
    authSchema,
    authorizationHeader,
    responseHeaders,
  });
  if (!token) {
    return {
      result: handleUnresolvedUser({
        payload,
        strategyName,
        responseHeaders,
        logMessage: `Invalid ${authSchema} token`,
      }),
    };
  }
  return await validateToken(token)
    .then((jwt) => {
      const profile = claimToProfile(jwt as ClaimTypes);
      return {
        result: {
          user: profile,
        },
      };
    })
    .catch((error) => ({
      result: handleTokenValidationError({
        payload,
        responseHeaders,
        strategyName,
        authSchema: authSchema as "Bearer",
        error,
      }),
    }));
};
