import { Endpoint, PayloadRequest } from "payload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AUTHJS_SESSION_COOKIE } from "@/lib/auth/config";
import { revokeUserSession } from "@/lib/auth/revokeUserSession";

const enableAfterLogoutHook = false;

/**
 * Relying on afterLogout on collection is not recommended as we have certain flows like backchannel where there is no PayloadRequest.
 *
 * I'm not confident in what this hook does to mimic its implementation when 'req' is not present.
 */
async function triggerAfterLogoutHook(req: PayloadRequest) {
  const collection = req.payload.collections[COLLECTION_SLUG_USERS];
  await collection.config.hooks.afterLogout.reduce(async (priorHook, hook) => {
    await priorHook;
    await hook({
      collection: collection.config,
      context: req.context,
      req,
    });
  }, Promise.resolve());
}

/**
 * Override the default logout endpoint to destroy the authjs session
 *
 * @see https://github.com/CrawlerCode/payload-authjs/blob/main/packages/payload-authjs
 * @see https://payloadcms.com/docs/authentication/operations#logout
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/logout.ts
 */
export const logoutEndpoint: Endpoint = {
  path: "/logout",
  method: "post",
  handler: async (req) => {
    const userId = req.user?.id;
    const { cookies } = await signOut({ redirect: false });
    await revokeUserSession({
      userId,
      clearSessions: true,
    });
    if (enableAfterLogoutHook) {
      await triggerAfterLogoutHook(req);
    }
    const response = NextResponse.json({
      message: req.t("authentication:logoutSuccessful"),
    });
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    response.cookies.delete(AUTHJS_SESSION_COOKIE);
    return response;
  },
};
