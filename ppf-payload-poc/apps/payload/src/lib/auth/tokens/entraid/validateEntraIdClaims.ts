import { jwtVerify, JWTVerifyOptions } from "jose";
import { z } from "zod";
import { createRemoteJWKSet } from "jose/jwks/remote";
import {
  AzureManagedIdentityAppClaims,
  EntraIDUserClaims,
  EntraIDBaseClaims,
} from "./EntraIdClaims";
import {
  assertClaimIsValidAzureResourceThrows,
  assertClaimIsEmailThrows,
  assertClaimOneOfThrows,
} from "../asserts";
import { assertClaimWithZodSchemaThrows } from "../asserts/assertClaimWithZodSchema";

const baseRequiredClaims = [
  "iss",
  "idtyp",
  "appid",
  "appidacr",
  "iat",
  "exp",
  "oid",
  "sub",
  "tid",
  "ver",
];

const userRequiredClaims = [
  ...new Set(
    [
      "aud",
      "sid",
      "name",
      "upn",
      "amr",
      "acr",
      "scp",
      "family_name",
      "given_name",
    ].concat(baseRequiredClaims)
  ),
];

const entraAppRequiredClaims = [
  ...new Set(
    ["idp", "xms_az_rid", "xms_mirid", "xms_tcdt", "xms_idrel"].concat(
      baseRequiredClaims
    )
  ),
];

const getConfig = () => {
  const tenantId =
    process.env.AZURE_TENANT_ID ?? "de7e7a67-ae61-49d2-97a7-526c910ad675";
  const issuer = `https://sts.windows.net/${tenantId}/`;

  const baseVerifyOptions: JWTVerifyOptions = {
    issuer: issuer,
    clockTolerance: 0,
    algorithms: ["RS256"],
    requiredClaims: baseRequiredClaims,
  };

  const optionsMap = {
    unknown: baseVerifyOptions,
    user: {
      ...baseVerifyOptions,
      audience: "https://management.azure.com",
      requiredClaims: userRequiredClaims,
    } as JWTVerifyOptions,
    app: {
      ...baseVerifyOptions,
      requiredClaims: entraAppRequiredClaims,
    } as JWTVerifyOptions,
  };

  const jwks_uri = "https://login.microsoftonline.com/common/discovery/keys";
  const jwks = createRemoteJWKSet(new URL(jwks_uri));

  return {
    jwks,
    tenantId,
    issuer,
    optionsMap,
  };
};

export async function validateEntraIdToken(
  token: string,
  idtyp?: "user" | "app"
): Promise<EntraIDUserClaims | AzureManagedIdentityAppClaims> {
  const { issuer, tenantId, optionsMap, jwks } = getConfig();
  if (idtyp === "user") {
    const { payload: user } = await jwtVerify<EntraIDUserClaims>(
      token,
      jwks,
      optionsMap.user
    );
    assertClaimWithZodSchemaThrows(user, "ipaddr", z.string().ip());
    assertClaimWithZodSchemaThrows(user, "tid", z.literal(tenantId));
    assertClaimWithZodSchemaThrows(user, "idtyp", z.literal(idtyp));
    assertClaimWithZodSchemaThrows(user, "acr", z.number().gt(0));
    assertClaimIsEmailThrows(user, "upn");
    assertClaimOneOfThrows(user, "amr", ["mfa", "pwd"]);
    return user;
  }
  if (idtyp === "app") {
    const { payload: app } = await jwtVerify<AzureManagedIdentityAppClaims>(
      token,
      jwks,
      optionsMap.app
    );
    assertClaimWithZodSchemaThrows(app, "tid", z.literal(tenantId));
    assertClaimWithZodSchemaThrows(app, "idtyp", z.literal(idtyp));
    assertClaimWithZodSchemaThrows(app, "iss", z.literal(issuer));
    assertClaimWithZodSchemaThrows(app, "idp", z.literal(issuer));
    assertClaimWithZodSchemaThrows(app, "appidacr", z.number().gt(1));
    assertClaimIsValidAzureResourceThrows(app, "xms_az_rid");
    assertClaimIsValidAzureResourceThrows(app, "xms_mirid");
    return app;
  }
  // If no idtyp is passed in the arguments we try to perform a base validation before trying again
  const { payload: jwt } = await jwtVerify<EntraIDBaseClaims>(
    token,
    jwks,
    optionsMap.unknown
  );
  assertClaimWithZodSchemaThrows(jwt, "idtyp", z.enum(["user", "app"]));
  return validateEntraIdToken(token, jwt.idtyp as "app" | "user");
}
