import { z } from "zod";
import { createRemoteJWKSet, jwtVerify, JWTVerifyOptions } from "jose";
import { LogoutTokenClaims } from "./logoutTokenClaims";
import { assertClaimWithZodSchemaThrows } from "../../asserts/assertClaimWithZodSchema";

interface LogoutTokenValidatorConfig {
  audience: Pick<JWTVerifyOptions, "audience">["audience"];
  issuer: Pick<JWTVerifyOptions, "issuer">["issuer"];
  allowed_jwt_algorithms: string[];
  jwks_uri: string;
}

export type ValidateLogoutFn = (
  logout_token: string
) => Promise<LogoutTokenClaims>;

export function createLogoutTokenValidator({
  audience,
  issuer,
  allowed_jwt_algorithms,
  jwks_uri,
}: LogoutTokenValidatorConfig): ValidateLogoutFn {
  const options: JWTVerifyOptions = {
    audience,
    issuer,
    algorithms: allowed_jwt_algorithms,
    requiredClaims: ["iss", "aud", "sub", "sid", "events", "iat", "purpose"],
    clockTolerance: 0,
  };
  const validateLogoutTokenThrows = async (logout_token: string) => {
    const jwks = createRemoteJWKSet(new URL(jwks_uri));
    const { payload: jwt } = await jwtVerify(logout_token, jwks, options);
    assertClaimWithZodSchemaThrows(
      jwt,
      "events",
      z.object({
        "http://schemas.openid.net/event/backchannel-logout": z.object({}),
      })
    );
    assertClaimWithZodSchemaThrows(jwt, "purpose", z.literal("logout"));
    return jwt as LogoutTokenClaims;
  };
  return validateLogoutTokenThrows;
}
