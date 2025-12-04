import { pageRoutes } from "@/routes";
import type { NextAuthConfig } from "next-auth";

export const SESSION_MAX_AGE_SECONDS = 24 * 3600;
export const SESSION_UPDATE_INTERVAL_SECONDS = 15;
export const TOKEN_VALID_TIME_SECONDS = 3600;

type SessionConfig = Pick<NextAuthConfig, "session">["session"];

export const nextAuthSessionConfig: SessionConfig = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  updateAge: SESSION_UPDATE_INTERVAL_SECONDS,
  strategy: "database",
};

export enum AuthProviderName {
  AzureAd = "AzureAD",
}

/**
 * @deprecated Remove this on next major merge
 */
export const CURITY_IF_PROVIDER_NAME = AuthProviderName.AzureAd;

export const OAUTH_DEFAULT_SCOPES = [
  "openid",
  "profile",
  "offline_access",
  "groups",
];
export const DEBUG_AUTH_ADAPTER = false;

export const ADMIN_PAGE_ROUTE = pageRoutes.Admin.pathname;

// Cookies
export const USE_SECURE_AUTHJS_COOKIES = (
  process.env.AUTH_URL ?? ""
).startsWith("https");

const AUTHJS_SECURE_PREFIX = USE_SECURE_AUTHJS_COOKIES ? "__Secure-" : "";
export const AUTHJS_SESSION_COOKIE = `${AUTHJS_SECURE_PREFIX}authjs.session-token`;

export const AUTHJS_CSRF_TOKEN_COOKIE = `${
  USE_SECURE_AUTHJS_COOKIES ? "__Host-" : ""
}authjs.csrf-token`;

export const OAUTH2_CLIENT_SCOPES = (() => {
  const isValidScope = /^[a-zA-Z_]+$/;
  const envScope = process.env.OAUTH2_CLIENT_SCOPE?.replace(/ /g, ",");
  const scopes =
    envScope && envScope.length > 0
      ? envScope.split(",").filter((scope) => isValidScope.test(scope))
      : OAUTH_DEFAULT_SCOPES;
  return scopes;
})();

export const OAUTH_BASE_URL = new URL(
  process.env.OAUTH2_ISSUER || "http://localhost"
);
export const OAUTH_ISSUER = new URL("/~", OAUTH_BASE_URL);
export const OAUTH_WELL_KNOWN_OPENID_CONFIG = new URL(
  "~/.well-known/openid-configuration",
  OAUTH_BASE_URL
);

export const OAUTH_TOKEN_ENDPOINT = new URL(
  "/oauth/v2/oauth-token",
  OAUTH_BASE_URL
);

export const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID!;

export const CMS_LOGIN_GROUP_ID =
  process.env.MSGRAPH_GROUPID_FOR_CMS_LOGIN ||
  process.env.MSGRAPH_GROUPID_FOR_SUPERADMIN;

export const enum CurityEnv {
  Dev = "authdev",
  Test = "authtest",
  Prod = "authprod",
}

export const curityIssuers = {
  [CurityEnv.Dev]: "https://authdev.ifext.biz/~",
  [CurityEnv.Test]: "https://authtest.if.eu/~",
  [CurityEnv.Prod]: "https://auth.if.eu/~",
};

export const defaultCmsConsumerScopes = ["partner.portal.content"];

export const allowedCurityEnvironments =
  process.env.DEPLOYED_ENV === "prod"
    ? [CurityEnv.Prod]
    : [CurityEnv.Dev, CurityEnv.Test];

export const defaultCurityEnvironment =
  process.env.DEPLOYED_ENV === "prod" ? CurityEnv.Prod : CurityEnv.Dev;
