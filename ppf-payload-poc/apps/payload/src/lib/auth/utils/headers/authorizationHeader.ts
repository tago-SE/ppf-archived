import { ApiError } from "next/dist/server/api-utils";

type AuthorizationSchema = "bearer" | "apikey";

/**
 * Extracts the authorization token from the request header and validates its schema.
 *
 * @param req - The incoming request.
 * @param schema - The expected authorization schema (e.g., "bearer" or "apikey").
 * @param headerName - The name of the header to retrieve the token from (defaults to "Authorization").
 * @returns The extracted token if the header is valid and matches the expected schema.
 * @throws ApiError - If the header is missing, malformed, or does not match the expected schema.
 */
export function getAuthorizationTokenFromHeaderThrows(
  headers: Headers,
  schema: AuthorizationSchema,
  headerName = "Authorization"
) {
  const authorization = headers.get(headerName);
  if (!authorization) {
    throw new ApiError(401, "Authorization header is required.");
  }
  const [parsedSchema, token] = authorization.split(" ");
  if (parsedSchema?.toLowerCase() != schema || !token) {
    throw new ApiError(
      401,
      "Unauthorized: Malformed Authorization header. Expected format: <schema> <token>."
    );
  }
  return token;
}

/**
 * Safe version of `getAuthorizationTokenFromHeaderThrows`, returning `null` instead of throwing an error.
 */
export function getAuthorizationTokenFromHeaderSafe(
  headers: Headers,
  schema: AuthorizationSchema,
  headerName = "Authorization"
) {
  try {
    return getAuthorizationTokenFromHeaderThrows(headers, schema, headerName);
  } catch (error) {
    return null;
  }
}
