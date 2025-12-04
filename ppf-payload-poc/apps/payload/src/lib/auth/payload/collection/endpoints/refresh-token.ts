import { Endpoint, headersWithCors, type PayloadHandler } from "payload";
import { User } from "@payload-types";
import { userFlowTokenHandler } from "@/lib/auth/userFlowTokenHandler";
import { payloadAuthenticate } from "@/lib/auth/payload/payloadAuthenticate";
import { routeErrorHandler } from "@/lib/utils/api/routeErrorHandler";
import { ApiError } from "next/dist/server/api-utils";
import { getNextAuthAdapter } from "@/lib/auth/adapters/payloadAdapter";
import {
  updateAccountSchema,
  validateAccountModelThrows,
} from "@/lib/auth/adapters/account/validationSchemas";

type RefreshTokenEndpointResult = {
  message: string;
  exp?: number;
  strategy?: string;
  user?: User;
};

/**
 * Overrides the refresh-token endpoint
 *
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/refresh.ts
 */
export const refreshEndpoint: Endpoint = {
  path: "/refresh-token",
  method: "post",
  handler: async (req) => {
    try {
      const { user } = await payloadAuthenticate(req);
      if (!user) {
        throw new ApiError(401, "Unauthorized");
      }
      const adapter = await getNextAuthAdapter();
      const foundAccount = await adapter.getUserLinkAccount(user.id);
      const account = validateAccountModelThrows(foundAccount);

      const { token, success, error } =
        await userFlowTokenHandler.refreshTokenAsync(account.refresh_token!);

      if (!success) {
        req.payload.logger.warn(
          { name: `/refresh-token`, error },
          `Failed to refresh tokens for this user.`
        );
        throw new ApiError(500, "Failed to refresh tokens for this user.");
      }
      
      const updatedAccount = updateAccountSchema.parse({
        ...account,
        ...token,
      });
      await adapter.linkAccount!(updatedAccount);
      const result: RefreshTokenEndpointResult = {
        message: req.t("authentication:tokenRefreshSuccessful"),
        exp: updatedAccount.expires_at,
        user,
      };
      return Response.json(result, {
        headers: headersWithCors({
          headers: new Headers(),
          req,
        }),
        status: 200,
      });
    } catch (error) {
      return routeErrorHandler(error);
    }
  },
};
