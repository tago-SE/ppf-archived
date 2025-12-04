import { JWTPayload } from "jose";
import { JOSEError, JWTClaimValidationFailed, JWTExpired } from "jose/errors";
import {
  assertClaimIsValidNumber,
  assertOptionalClaimIsValidNumber,
} from "./errors";

export enum TokenExpCheckResult {
  /**
   * The token is fresh and ready to be used.
   */
  Fresh = "OK_FRESH",
  /**
   * The token is valid but should be refreshed.
   */
  Stale = "OK_STALE",
  /**
   * The token has expired.
   */
  Expired = "ERR_EXPIRED",
  /**
   * The token has either expired or contains an error.
   */
  ValidationError = "ERR_VALIDATION",
}

type TokenCheckInfo = {
  ttl: number;
  elapsed: number;
  remaining: number;
  buffer: number;
  timeUntilReady?: number;
};

type TokenExpirationCheckResult = {
  /**
   * Resulting status of the check based on nbf, iat, exp
   */
  status: TokenExpCheckResult;
  /**
   * Is valid when remaining seconds > 0 and no errors are present
   */
  isValid: boolean;
  /**
   * Stale indicates that the token has either expired or is about to expire and should be refreshed if possible.
   */
  isStale: boolean;
  /**
   * Debug details
   */
  info?: TokenCheckInfo;
  /**
   * TokenValidionError which is present when isValid is falsea
   */
  error?: Error;
};

function parseTokenTimeClaims(jwt: JWTPayload) {
  const { result: parsedExp, error: expError } = assertClaimIsValidNumber(
    jwt,
    "exp"
  );
  if (!!expError) {
    return { error: expError, parsedExp: 0, parsedIat: 0, parsedNbf: 0 };
  }
  const { result: parsedIat, error: iatError } = assertClaimIsValidNumber(
    jwt,
    "iat"
  );
  if (!!iatError) {
    return { error: iatError, parsedExp: 0, parsedIat: 0, parsedNbf: 0 };
  }
  if (parsedExp <= parsedIat) {
    return {
      parsedExp,
      parsedIat,
      parsedNbf: 0,
      error: new JWTClaimValidationFailed(
        "'exp' must be greater than 'iat'",
        jwt,
        "exp"
      ),
    };
  }
  const { result: parsedNbf, error: nbfError } =
    assertOptionalClaimIsValidNumber(jwt, "nbf");
  if (!!nbfError) {
    return { error: nbfError, parsedIat, parsedExp };
  }
  return { parsedExp, parsedIat, parsedNbf };
}

export function createTokenExpirationResult(
  status: TokenExpCheckResult,
  error?: Error,
  info?: TokenCheckInfo
): TokenExpirationCheckResult {
  const isStale =
    status == TokenExpCheckResult.Stale ||
    status == TokenExpCheckResult.Expired ||
    (!!error && error instanceof JWTExpired);
  const isValid =
    !error &&
    (status == TokenExpCheckResult.Stale ||
      status == TokenExpCheckResult.Fresh);
  return {
    status,
    isStale: isStale,
    isValid: isValid,
    error: error,
    info,
  };
}

// export function createExpiredTokenResult(
//   error?: JWTExpired,
//   info?: TokenCheckInfo
// ) {
//   return createTokenExpirationResult(TokenExpCheckResult.Expired, error, info);
// }

// export function createTokenValidationErrorResult(
//   error: JOSEError,
//   info?: TokenCheckInfo
// ) {
//   return createTokenExpirationResult(
//     TokenExpCheckResult.ValidationError,
//     error,
//     info
//   );
// }

// export function validateTokenTimeClaims(
//   jwt: JWTPayload
// ): TokenExpirationCheckResult {
//   const now = Math.floor(Date.now() / 1000);
//   let timeUntilReady = 0;
//   let remaining = 0;
//   const {
//     error: parseError,
//     parsedExp,
//     parsedIat,
//     parsedNbf,
//   } = parseTokenTimeClaims(jwt);

//   if (!!parseError) {
//     return createTokenValidationErrorResult(parseError);
//   }
//   // if NBF is present we check it
//   if (parsedNbf !== undefined && now < parsedNbf) {
//     timeUntilReady = parsedNbf - now;
//     return createTokenValidationErrorResult(
//       new JWTClaimValidationFailed(
//         `Time until ready: ${timeUntilReady}s.`,
//         jwt,
//         "nbf"
//       )
//     );
//   }
//   const ttl = parsedExp - parsedIat;
//   const elapsed = now - parsedIat;
//   remaining = parsedExp - now;
//   const buffer = Math.min(Math.max(ttl * 0.5, ttl), 3600); // 50% of TTL or 1h
//   const info: TokenCheckInfo = {
//     ttl,
//     elapsed,
//     remaining,
//     buffer,
//     timeUntilReady,
//   };
//   if (remaining <= 0) {
//     return createExpiredTokenResult(
//       new JWTExpired(`Token expired remaining time: ${remaining}`, jwt, "exp"),
//       info
//     );
//   }
//   if (remaining <= buffer) {
//     return createTokenExpirationResult(
//       TokenExpCheckResult.Stale,
//       undefined,
//       info
//     );
//   }
//   return createTokenExpirationResult(
//     TokenExpCheckResult.Fresh,
//     undefined,
//     info
//   );
// }
