export const ifInsuranceApiCurityAuthorization =
  "IfInsurance-API-Authorization";
const ifInsuranceApiCorrelationId = "IfInsurance-API-Correlation-Id";
const ifInsuranceApiPartnerId = "IfInsurance-API-PartnerId";
const ifInsuranceApiContextOperationId = "IfInsurance-API-Context-Operation-Id";
const ifInsuranceApiSourceApi = "IfInsurance-API-Source-IP";

/**
 * Represents the headers required for API Platform authentication and tracking.
 * @confluence https://confluence.ifint.biz/spaces/OA/pages/122029371/Custom+API+platform+headers
 */
export type ApiPlatformHeaders = {
  /**
   * Authorization token used to verify that the request is coming from the API Platform.
   * See API back-end security documentation for usage details.
   *
   * @confluence https://confluence.ifint.biz/spaces/OA/pages/132582313/API+back-end+security
   */
  Authorization: string;

  /**
   * When using OAuth2 and Curity, the original Curity token is forwarded in this header.
   * The Authorization header from Curity will be overwritten.
   */
  [ifInsuranceApiCurityAuthorization]: string;

  /**
   * Unique identifier of the API operation being executed.
   */
  [ifInsuranceApiContextOperationId]?: string;

  /**
   * Correlation ID set by F5 (Ifs Web Application Firewall) to track an incoming request to backend systems.
   * Can be overridden by a custom value to track requests across different systems.
   */
  [ifInsuranceApiCorrelationId]?: string;

  /**
   * IP address of the client making the API request.
   */
  [ifInsuranceApiSourceApi]?: string;

  /**
   * (New in v3) Unique identifier of the API consumer making the request.
   * For a specific partner, this value remains consistent across all calls in all environments.
   * The PartnerId can be found in the API Platform Inventory Report.
   */
  [ifInsuranceApiPartnerId]: string;
};

const responseHeadersToAdd = [
  ifInsuranceApiCorrelationId,
  ifInsuranceApiPartnerId,
  ifInsuranceApiContextOperationId,
] as const;

export function addApiPlatformResponseHeadersWhenPresent(
  requestHeaders: Headers,
  responseHeaders: Headers
) {
  for (let headerName of responseHeadersToAdd) {
    const value = requestHeaders.get(headerName);
    if (!!value) {
      responseHeaders.set(headerName, value);
    }
  }
}
