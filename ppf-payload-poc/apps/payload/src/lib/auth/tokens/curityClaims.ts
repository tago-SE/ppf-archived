export type CurityBaseClaims = {
  /**
   * JWT Issuer
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss: string;
  /**
   * JWT Subject
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub: string;
  /**
   * JWT Audience
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud: string | string[];
  /**
   * JWT ID
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti: string;
  /**
   * JWT Not Before
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf?: number;
  /**
   * JWT Expiration Time
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp: number;
  /**
   * JWT Issued At
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat: number;
};

export type CurityClientAccessTokenClaims = CurityBaseClaims & {
  /**
   * The set of scopes required.
   */
  scope: string[];
  /**
   * Purpose
   */
  purpose: "access_token";
  /**
   * Client Id - Curity Specific
   */
  client_id?: string;
  /**
   * API Platform
   */
  client_partner_id?: string;
};

/**
 *  Curity Id Token claims
 */
export type CurityIdTokenClaims = CurityBaseClaims & {
  auth_time: number;
  purpose: "id";
  at_hash?: string;
  amr: string;
  oid: string;
  preferred_username: string;
  nonce: string;
  sid: string;
  acr: string;
  delegation_id: string;
  /**
   * Authorized party - the party to which the ID Token was issued. If present, it MUST contain the OAuth 2.0 Client ID of this party.
   */
  azp?: string;
  name: string;
  email: string;
  /**
   * Country
   */
  ctry?: string;
  /**
   * First name
   */
  given_name?: string;
  /**
   * Last name
   */
  family_name?: string;
  email_verified?: string;
  picture?: string;
  jobTitle?: string;
  onprem_sid?: string;
  in_corp?: string;
  userID?: string;
  department?: string;
  groups?: string[];
  "employee.id"?: string;
};

export function isCurityProfile(value: CurityIdTokenClaims): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    value?.purpose === "id" &&
    typeof value?.acr === "string" &&
    value.acr.includes(":curity:") &&
    typeof value?.userID === "string" &&
    typeof value?.email === "string" &&
    typeof value?.sub === "string"
  );
}
