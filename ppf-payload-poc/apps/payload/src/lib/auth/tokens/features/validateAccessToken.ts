import { z } from "zod";
import {
  createRemoteJWKSet,
  JWTPayload,
  jwtVerify,
  JWTVerifyOptions,
} from "jose";
import {
  assertClaimScopeThrows,
  assertClaimWithZodSchemaThrows,
} from "../asserts";

type AccessTokenValidatorConfig = {
  audience: Pick<JWTVerifyOptions, "audience">["audience"];
  issuer: Pick<JWTVerifyOptions, "issuer">["issuer"];
  client_id?: string;
  allowed_jwt_algorithms: string[];
  jwks_uri: string;
  required_scopes: string[];
  recuired_claims?: string[];
  allowed_acrs?: string[];
};

export type ValidateAccessTokenFn = (
  access_token: string
) => Promise<JWTPayload>;

/**
 * Validates an access token and ensures it meets the required claims and constraints.
 *
 * This function verifies the token using a remote JWKS endpoint, ensuring that it has:
 *
 * - The expected audience, issuer, and algorithms.
 *
 * - Default Required claims, including `purpose`, `scope`, `exp`, `sub`, `aud`, `iat`, `iss`, and optionally `client_id`.
 *
 * - A valid `scope` that includes the required scopes.
 *
 * - (Optional) An `acr` value that is among the allowed ACRs.
 *
 * @throws {JWTExpired} If the token has expired.
 * @throws {JWTClaimValidationFailed} If a required claim is missing or invalid.
 * @throws {Error} If any other validation fails.
 *
 * @param {AccessTokenValidatorConfig} config - Configuration options for access token validation.
 * @returns {ValidateAccessTokenFn} A function that validates an access token.
 */
export function createAccessTokenValidator({
  audience,
  issuer,
  client_id,
  allowed_jwt_algorithms,
  jwks_uri,
  required_scopes,
  allowed_acrs,
  recuired_claims,
}: AccessTokenValidatorConfig): ValidateAccessTokenFn {
  // NOTE: 'acr' and 'oid' is not included by default as they are not always present
  let defaultClaims = ["purpose", "scope", "exp", "sub", "aud", "iat", "iss"];
  if (client_id) {
    defaultClaims.push("client_id");
  }
  if (allowed_acrs && allowed_acrs.length > 0) {
    defaultClaims.push("acr");
  }
  const requiredClaims = Array.from(
    new Set([...defaultClaims, ...(recuired_claims ?? [])])
  );
  const options: JWTVerifyOptions = {
    audience,
    issuer,
    algorithms: allowed_jwt_algorithms,
    requiredClaims,
    clockTolerance: 0,
  };
  const handler = async (token: string) => {
    const jwks = createRemoteJWKSet(new URL(jwks_uri));
    const { payload: jwt } = await jwtVerify(token, jwks, options);
    assertClaimWithZodSchemaThrows(jwt, "purpose", z.literal("access_token"));
    assertClaimScopeThrows(jwt, "scope", required_scopes);
    if (client_id) {
      assertClaimWithZodSchemaThrows(jwt, "client_id", z.literal(client_id));
    }
    if (allowed_acrs && allowed_acrs.length > 0) {
      assertClaimWithZodSchemaThrows(
        jwt,
        "acr",
        z.string().refine((x) => allowed_acrs.includes(x))
      );
    }
    return jwt;
  };
  return handler;
}
