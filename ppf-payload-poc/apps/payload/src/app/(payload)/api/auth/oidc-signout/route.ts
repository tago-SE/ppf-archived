import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import {
  ApiResponse,
  formatApiResponse,
} from "@/lib/utils/api/formatApiResponse";
import { routeErrorHandler } from "@/lib/utils/api/routeErrorHandler";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { parseRequestBodyThrows } from "@/lib/utils/api/parseRequestBody";
import Logger from "@/lib/logging";
import { userFlowTokenHandler } from "@/lib/auth/userFlowTokenHandler";
import { payloadAuthenticate } from "@/lib/auth/payload/payloadAuthenticate";
import { gettUsersByClaims } from "@/lib/auth/adapters/user";
import { revokeUserSession } from "@/lib/auth/revokeUserSession";

const logger = new Logger({ tags: ["auth", "oidc-signout"] });

type RequestBody = {
  logout_token?: string;
};

const reqBodySchema = z.object({
  logout_token: z.string().optional(),
}) satisfies z.ZodSchema<RequestBody>;

type UserLogoutResult = {
  userId: string;
  access_token: boolean;
  refresh_token: boolean;
  cleared_sessions: number;
};

/**
 * Backchannel logout using logout_token. 
 * 
 * Supports two modes:
 *
 * 1. When a valid `logout_token` is provided in the request body, the token is validated.
 *    and the corresponding users are looked up and logged out.
 *
 * 2. When no `logout_token` is provided, the endpoint attempts to authenticate the request and then sign-out that user.
 *
 * @returns ApiResponse with the results of the logout operation.
 *
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const payload = await getPayloadWithConfig();
    const body = await parseRequestBodyThrows(req);
    let parsedBody = reqBodySchema.parse(body);
    const logout_token = parsedBody.logout_token;
    let userIds: Array<string> = [];
    if (logout_token) {
      const { sub } = await userFlowTokenHandler.validateLogoutToken(
        logout_token
      );
      userIds = (
        await gettUsersByClaims(
          {
            sub, // It would perhaps be better if we had the oid claim instead of the sub (need to ask AuthHub),
          },
          { payload }
        )
      ).map((user) => user.id);
    } else {
      const { user } = await payloadAuthenticate(req);
      if (user) {
        userIds = [user.id];
      }
    }
    const results = await revokeUserSession({
      userId: userIds,
      clearSessions: true,
    });
    const message =
      results.length === 0
        ? "No matching user found."
        : "Token revokation completed successfully.";
    return formatApiResponse<Array<UserLogoutResult>>(results, message, 200);
  } catch (error) {
    logger.error("Error", error);
    return routeErrorHandler(error);
  }
}
