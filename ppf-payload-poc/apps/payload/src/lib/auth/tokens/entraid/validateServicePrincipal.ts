import { jwtVerify, type JWTVerifyOptions } from "jose";
import { createRemoteJWKSet } from "jose/jwks/remote";
import { type AzureManagedIdentityAppClaims, IdType } from "./EntraIdClaims";
import {
  assertClaimIsValidAzureResourceThrows,
  assertClaimOneOfThrows,
  assertClaimWithZodSchemaThrows,
} from "../asserts";
import { z } from "zod";

type RequiredClaimsArray = Array<keyof AzureManagedIdentityAppClaims>;

export const minRequiredManagedIdentityClaims: RequiredClaimsArray = [
  "iss",
  "aud",
  "idtyp",
  "appid",
  "appidacr",
  "iat",
  "idp",
  "exp",
  "oid",
  "sub",
  "tid",
  "ver",
  "xms_az_rid",
  "xms_mirid",
  "xms_tcdt",
  "xms_idrel",
];

export type JWTVerifyEntraServicePrincipalOptions = {
  clientId: string;
  principalId: string;
  tid: string;
  issuer?: string;
  requiredClaims: RequiredClaimsArray;
  audience: "https://management.azure.com";
};

/**
 * Validates an Entra Service Principal JWT.
 *
 * @throws {JOSEError}
 */
export async function jwtVerifyEntraServicePrincipalThrows(
  access_token: string,
  {
    requiredClaims,
    tid,
    issuer,
    audience,
    clientId,
    principalId,
  }: JWTVerifyEntraServicePrincipalOptions
) {
  const jwks_uri = "https://login.microsoftonline.com/common/discovery/keys";
  const jwks = createRemoteJWKSet(new URL(jwks_uri));
  const options: JWTVerifyOptions = {
    issuer: issuer || `https://sts.windows.net/${tid}/`,
    audience: audience,
    clockTolerance: 0,
    algorithms: ["RS256"],
    requiredClaims: [
      ...new Set(requiredClaims.concat(minRequiredManagedIdentityClaims)),
    ] as string[],
  };
  const { payload: jwt } = await jwtVerify<AzureManagedIdentityAppClaims>(
    access_token,
    jwks,
    options
  );
  assertClaimWithZodSchemaThrows(jwt, "sub", z.literal(principalId));
  assertClaimWithZodSchemaThrows(jwt, "oid", z.literal(principalId));
  assertClaimWithZodSchemaThrows(jwt, "appid", z.literal(clientId));
  assertClaimWithZodSchemaThrows(jwt, "tid", z.literal(tid));
  assertClaimWithZodSchemaThrows(jwt, "idtyp", z.literal(IdType.App));
  assertClaimWithZodSchemaThrows(jwt, "iss", z.literal(issuer));
  assertClaimWithZodSchemaThrows(jwt, "idp", z.literal(issuer));
  assertClaimWithZodSchemaThrows(jwt, "appidacr", z.number().gt(1));
  assertClaimOneOfThrows(jwt, "ver", ["1.0", "2.0"]);
  assertClaimIsValidAzureResourceThrows(jwt, "xms_az_rid");
  assertClaimIsValidAzureResourceThrows(jwt, "xms_mirid");
  return jwt as AzureManagedIdentityAppClaims;
}

export async function jwtVerifyAnyEntraServicePrincipalThrows(
  access_token: string,
  optionsArray: JWTVerifyEntraServicePrincipalOptions[]
): Promise<AzureManagedIdentityAppClaims> {
  if (Array.isArray(optionsArray) && optionsArray.length === 0) {
    throw new Error("Must provide one or many JWTVerifyOptions");
  }
  return (await Promise.any(
    optionsArray.map((option) =>
      jwtVerifyEntraServicePrincipalThrows(access_token, option)
    )
  )) as AzureManagedIdentityAppClaims;
}
