import { NextRequest, NextResponse } from "next/server";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import Logger from "@/lib/logging";
import { userFlowTokenHandler } from "@/lib/auth/userFlowTokenHandler";
import { payloadAuthenticate } from "@/lib/auth/payload/payloadAuthenticate";
import { getUserLinkAccount } from "@/lib/auth/adapters/account";
import { OAUTH2_CLIENT_ID } from "../../../../../lib/auth/config/index";
import { decodeJwt } from "jose";
import { CurityIdTokenClaims as CurityProfile } from "@/lib/auth/tokens/curityClaims";

const logger = new Logger({ tags: ["auth", "federated-logout"] });

/**
 *
 * Federated signout to coordinate logout across different Identity Providers
 *
 * Should sign you out: https://authdevifcuritydemo.azurewebsites.net/
 *
 * @See https://github.com/nextauthjs/next-auth/issues/836
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // We may need to handle both redirectTo and csrfToken on this endpoint
    const payload = await getPayloadWithConfig();
    const { user } = await payloadAuthenticate(req);
    let id_token_hint: string | undefined;
    let logout_hint: string | undefined;
    const post_logout_redirect_uri = new URL("/", process.env.AUTH_URL!);
    logger.info("Incoming", {
      post_logout_redirect_uri: post_logout_redirect_uri.href,
    });
    if (!!user) {
      const account = await getUserLinkAccount(user.id, { payload });
      id_token_hint = account?.id_token ?? "";
      const profile = decodeJwt<CurityProfile>(id_token_hint);
      logout_hint = profile.sid;
    }
    const { end_session_endpoint } =
      userFlowTokenHandler.prepareEndSessionRequest({
        id_token_hint: id_token_hint,
        federatedLogout: true,
        client_id: OAUTH2_CLIENT_ID,
        // state: csrfToken, issue with whitelist
        // logout_hint:   ,
      });

    const headers: Headers = new Headers({
      "Access-Control-Allow-Origin": post_logout_redirect_uri.origin,
    });
    logger.info("Redirect", end_session_endpoint.href, logout_hint);
    return NextResponse.redirect(end_session_endpoint, {
      status: 302,
      headers,
    });
  } catch (error) {
    logger.error("Error", error);
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL!);
    redirectUrl.searchParams.set("error", "logout_failed");
    return NextResponse.redirect(redirectUrl, {
      status: 302,
    });
  }
}
