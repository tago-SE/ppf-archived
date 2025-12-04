import OktaProvider, { OktaProfile } from "next-auth/providers/okta";
import {
  CurityIdTokenClaims as CurityProfile,
  isCurityProfile,
} from "../tokens/curityClaims";
import {
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SCOPES,
  OAUTH_ISSUER,
  OAUTH_WELL_KNOWN_OPENID_CONFIG,
  AuthProviderName,
} from "../config";
import { curityAzureAdProfileToUser } from "./parseClaimsToUser";

export const providers = [
  /**
   * ### Resources
   *
   *  - [Okta OAuth documentation](https://developer.okta.com/docs/reference/api/oidc)
   *
   * ### Notes
   *
   * By default, Auth.js assumes that the Okta provider is
   * based on the [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) specification.
   *
   * :::tip
   *
   * The Okta provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/okta.ts).
   * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/configuring-oauth-providers).
   *
   * :::
   *
   * :::info **Disclaimer**
   *
   * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
   *
   * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
   * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
   * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
   *
   * :::s/okta.ts
   */
  OktaProvider<CurityProfile & OktaProfile>(
    // Maybe we can replace OKTA to just default provider
    {
      id: AuthProviderName.AzureAd,
      clientId: OAUTH2_CLIENT_ID,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET,
      issuer: OAUTH_ISSUER.href,
      wellKnown: OAUTH_WELL_KNOWN_OPENID_CONFIG.href,
      checks: ["pkce", "state", "nonce"],
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { scope: OAUTH2_CLIENT_SCOPES.join(" ") },
      },
      profile(claims) {
        if (isCurityProfile(claims)) {
          return curityAzureAdProfileToUser(claims);
        }
        throw "Unable to parse claims";
      },
    }
  ),
];
