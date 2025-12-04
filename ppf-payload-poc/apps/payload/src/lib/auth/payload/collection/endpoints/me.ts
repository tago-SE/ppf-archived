import { Endpoint, headersWithCors, PayloadHandler } from "payload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { User } from "@/payload-types";
import { extractUserLinkAccount } from "@/lib/auth/adapters/account/getUserLinkAccount";
import type { UserWithToken } from "@payloadcms/ui";
import { payloadAuthenticate } from "@/lib/auth/payload/payloadAuthenticate";

type MeEndpointResult = Omit<UserWithToken<User | null>, "token" | "exp"> & {
  exp?: number;
  collection?: string;
  message?: string;
};

/**
 * Overrides the default /me endpoint 
 * 
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/me.ts
 */
export const meEndpoint: Endpoint = {
  path: "/me",
  method: "get",
  handler: async (req) => {
    const { user } = await payloadAuthenticate(req);
    let result: MeEndpointResult = {
      user: user,
      collection: COLLECTION_SLUG_USERS,
      exp: undefined,
      message: req.t("authentication:account"),
    };
    if (Boolean(user)) {
      const linkAccount = extractUserLinkAccount(user!);
      result.exp = linkAccount?.expires_at;
    }
    return Response.json(result, {
      headers: headersWithCors({
        headers: new Headers(),
        req,
      }),
      status: 200,
    });
  },
};
