import { JOSEError, JWTClaimValidationFailed, JWTExpired } from "jose/errors";
import { Payload } from "payload";
import {
  createAuthLogError,
  createAuthLogInfo as infoDetails,
} from "./errorObj";

type TokenValidationErrorArgs = {
  error: AggregateError | JOSEError | unknown;
  responseHeaders: Headers;
  payload: Payload;
  strategyName: string;
  authSchema: "Bearer";
};

type HandleUnresolvedTokenArgs = { logMessage: string } & Omit<
  TokenValidationErrorArgs,
  "error" | "authSchema"
>;

export const handleTokenValidationError = ({
  error,
  responseHeaders,
  payload,
  strategyName,
  authSchema,
}: TokenValidationErrorArgs) => {
  let errorMessage = `${authSchema} realm="example", error="unexpected_error", error_description="Unexpected error occured"`;
  let _error = error;
  if (error instanceof AggregateError) {
    errorMessage = `${authSchema} realm="example", error="aggregate_token_validation", error_description="The access token validation failed"`;
    if (error.errors.length > 0) {
      _error = error.errors[0];
    }
  }
  if (_error instanceof JWTExpired) {
    errorMessage = `${authSchema} realm="example", error="expired_token", error_description="The access token has expired"`;
  } else if (_error instanceof JWTClaimValidationFailed) {
    errorMessage = `${authSchema} realm="example", error="token_validation", error_description="The access token validation failed"`;
  }
  responseHeaders.append("WWW-Authenticate", errorMessage);
  payload.logger.error(
    createAuthLogError({
      strategyName,
      responseHeaders,
      error: error instanceof AggregateError ? error.errors : error,
    }),
    `TokenValidationError`
  );
  return { user: null, responseHeaders };
};

export const handleUnresolvedUser = ({
  payload,
  strategyName,
  responseHeaders,
  logMessage,
}: HandleUnresolvedTokenArgs) => {
  payload.logger.warn(
    infoDetails({ strategyName, responseHeaders }),
    logMessage
  );
  return { user: null, responseHeaders };
};