import { z } from "zod";
import type { JWTPayload } from "jose";
import { assertClaimWithZodSchemaThrows } from "./assertClaimWithZodSchema";
import { assertClaimOneOfThrows } from "./assertClaimOneOf";
import { assertClaimIsValidAzureResourceThrows } from "./assertClaimIsValidAzureResource";
import { assertClaimHasRequiredScopeThrows } from "./assertClaimScope";

export { assertClaimWithZodSchemaThrows };

export { assertClaimHasRequiredScopeThrows as assertClaimScopeThrows };

export { assertClaimIsValidAzureResourceThrows };

export { assertClaimOneOfThrows };

export const assertClaimIsEmailThrows = (jwt: JWTPayload, claim: string) =>
  assertClaimWithZodSchemaThrows(jwt, claim, z.string().email());
