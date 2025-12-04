import type { JWTPayload } from "jose";
import { JWTClaimValidationFailed } from "jose/errors";

export function createMissingClaimError(jwt: JWTPayload, claim: string) {
  return new JWTClaimValidationFailed(
    `Missing "${claim}" claim`,
    jwt,
    claim,
    "missing"
  );
}

/**
 * @deprecated
 */
export function assertClaimIsValidNumber(jwt: JWTPayload, claim: string) {
  let error: JWTClaimValidationFailed | undefined = undefined;
  if (!jwt[claim]) {
    error = createMissingClaimError(jwt, claim);
    return {
      error,
      success: false,
      result: 0,
    };
  }
  const parsedClaim = Number(jwt[claim]);
  if (isNaN(parsedClaim)) {
    error = new JWTClaimValidationFailed(
      `Claim "${claim}" must be a valid number`,
      jwt,
      claim,
      "check_failed"
    );
    return { error, success: false, result: 0 };
  }
  return { success: true, result: parsedClaim, error: undefined };
}

/**
 * @deprecated
 */
export function assertOptionalClaimIsValidNumber(
  jwt: JWTPayload,
  claim: string
) {
  if (!jwt[claim]) {
    return { error: undefined, success: true, result: undefined };
  }
  return assertClaimIsValidNumber(jwt, claim);
}
