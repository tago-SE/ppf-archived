type RevokeTokenConfig = {
  /**
   *
   * https://curity.io/docs/idsvr/latest/token-service-admin-guide/session-logout.html#oauth-session-and-logout
   
   * Example:
   *  {issuer}/oauth/v2/oauth-session/logout
   */
  end_session_endpoint: URL | string;
};

type EndSessionArgs = {
  /**
   * Redirect URL value that indicates where to redirect the user after logout. If excluded it will not redirect back to the application.
   */
  post_logout_redirect_uri?: URL;
  /**
   * The ID token to use to identify which SSO session to terminate.
   */
  id_token_hint?: string;

  /**
   * The client id of the requestor.
   */
  client_id?: string;
  /**
   * (Curity-Specific 'global') Combined with client_id or ID token, send this parameter with a value of true to request logout of all the user’s SSO sessions.
   */
  federatedLogout?: boolean;
  /**
   * Session ID (sid) value that indicates which user to log out.
   */
  logout_hint?: string;
  /**
   * Opaque value that the application adds to the initial logout request, and that Auth0 includes when redirecting the back to the post_logout_redirect_uri
   *
   * Useful for CSRF protection.
   */
  state?: string;
};

type EndSessionRequestConfig = {
  /**
   * The final end_session_endpoint to use with configured parameters.
   */
  end_session_endpoint: URL;
};

export function createEndSessionHandler({
  end_session_endpoint,
}: RevokeTokenConfig) {
  const builder = ({
    id_token_hint,
    logout_hint,
    federatedLogout,
    post_logout_redirect_uri,
    state,
    client_id,
  }: EndSessionArgs) => {
    const url = new URL(end_session_endpoint);
    if (client_id) {
      url.searchParams.set("client_id", client_id);
    }
    if (id_token_hint) {
      url.searchParams.set("id_token_hint", id_token_hint);
    }
    if (federatedLogout) {
      url.searchParams.set("global", "true");
    }
    if (logout_hint) {
      url.searchParams.set("logout_hint", logout_hint);
    }
    if (post_logout_redirect_uri) {
      url.searchParams.set(
        "post_logout_redirect_uri",
        post_logout_redirect_uri.href
      );
    }
    if (state) {
      url.searchParams.set("state", state);
    }
    return {
      end_session_endpoint: url,
    } as EndSessionRequestConfig;
  };
  return builder;
}
