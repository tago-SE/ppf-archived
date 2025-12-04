const keys = [
  "openid_configuration",
  "pushed_authorization_request_endpoint",
  "introspection_endpoint",
  "issuer",
  "authorization_endpoint",
  "token_endpoint",
  "userinfo_endpoint",
  "check_session_iframe",
  "device_authorization_endpoint",
  "end_session_endpoint",
  "revocation_endpoint",
  "backchannel_authentication_endpoint",
  "jwks_uri",
  "assisted_token_endpoint",
  "registration_endpoint",
] as const;

type PathKey = (typeof keys)[number];

const OAUTH_OIDC_ENDPOINTS: Record<PathKey, string> = {
  // If we use openid_configuration path we could populate this dynamically, have decided not to do that for now...
  openid_configuration: "/~/.well-known/openid-configuration",
  pushed_authorization_request_endpoint: "/oauth/v2/oauth-authorize/par",
  introspection_endpoint: "/oauth/v2/oauth-introspect",
  issuer: "/~",
  authorization_endpoint: "/oauth/v2/oauth-authorize",
  token_endpoint: "/oauth/v2/oauth-token",
  userinfo_endpoint: "/oauth/v2/oauth-userinfo",
  check_session_iframe: "/oauth/v2/oauth-session",
  device_authorization_endpoint: "/oauth/v2/oauth-device/device",
  end_session_endpoint: "/oauth/v2/oauth-session/logout",
  revocation_endpoint: "/oauth/v2/oauth-revoke",
  backchannel_authentication_endpoint:
    "/token-service/oauth-backchannel-authentication",
  jwks_uri: "/~/jwks",
  assisted_token_endpoint: "/oauth/v2/oauth-assisted-token",
  registration_endpoint: "/token-service/oauth-registration",
};

export function getOidcEndpointsForAuthority(
  baseUrl: string | URL
): Record<PathKey, string> {
  return Object.keys(OAUTH_OIDC_ENDPOINTS).reduce((acc, key) => {
    const typedKey = key as PathKey;
    acc[typedKey] = new URL(OAUTH_OIDC_ENDPOINTS[typedKey], baseUrl).href;
    return acc;
  }, {} as Record<PathKey, string>);
}
