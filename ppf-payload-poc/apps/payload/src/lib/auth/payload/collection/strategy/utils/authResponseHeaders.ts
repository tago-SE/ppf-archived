import { getCorrelationIdHeader } from "@/lib/utils/api/headers";
import { addApiPlatformResponseHeadersWhenPresent } from "../if-api-platform/if-api-headers";

export const createAuthenticationResponseHeader = ({
  requestHeaders,
}: {
  requestHeaders: Headers;
}) => {
  const correlationId = getCorrelationIdHeader(requestHeaders);
  const responseHeaders = new Headers({
    [correlationId.name]: correlationId.value!,
    "x-start": new Date().toISOString(),
  });
  addApiPlatformResponseHeadersWhenPresent(requestHeaders, responseHeaders);
  return responseHeaders;
};
