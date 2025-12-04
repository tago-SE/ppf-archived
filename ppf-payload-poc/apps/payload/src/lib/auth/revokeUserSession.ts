import { clearAccountTokens, getUserLinkAccount } from "./adapters/account";
import { userFlowTokenHandler } from "./userFlowTokenHandler";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { deleteSessionsByUserId } from "./adapters/session";
import Logger from "@/lib/logging";

type UserLogoutResult = {
  userId: string;
  access_token: boolean;
  refresh_token: boolean;
  cleared_sessions: number;
};

type UserLogoutActionArgs = {
  /**
   * UserId or Array of userIds to revoke
   */
  userId: string | string[] | undefined;
  /**
   * It may be desireable to not delete the sessions here but let that be managed internally, by default this is true.
   */
  clearSessions: boolean;
};

const logger = new Logger({ tags: ["revokeUserSession"] });

/**
 * This will revoke the account the user (or users) is currently using `getUserLinkAccount` and revoke the acceess_token and refresh_token.
 *
 * Note:
 *  - Does not revoke id_token
 *  - Optionally does not clear the user sessions from the database.
 */
export async function revokeUserSession({
  userId,
  clearSessions = true,
}: UserLogoutActionArgs): Promise<Array<UserLogoutResult>> {
  if (!userId) return [];
  const payload = await getPayloadWithConfig();
  return await Promise.all(
    (Array.isArray(userId) ? userId : [userId]).map(async (userId) => {
      const tokenRevocationResults: UserLogoutResult = {
        userId: userId,
        access_token: false,
        refresh_token: false,
        cleared_sessions: 0,
      };
      const account = await getUserLinkAccount(userId, { payload });
      if (!account) {
        return tokenRevocationResults;
      }
      if (!!account.access_token) {
        tokenRevocationResults.access_token =
          await userFlowTokenHandler.revokeTokenAsync(
            account.access_token!,
            "access_token"
          );
      }
      if (!!account.refresh_token) {
        tokenRevocationResults.refresh_token =
          await userFlowTokenHandler.revokeTokenAsync(
            account.refresh_token!,
            "refresh_token"
          );
      }
      await clearAccountTokens(
        {
          userId: account.userId,
          tokens: {
            refresh_token: true,
            access_token: true,
            id_token: false,
          },
        },
        { payload }
      );
      if (clearSessions) {
        tokenRevocationResults.cleared_sessions = await deleteSessionsByUserId(
          userId,
          { payload }
        );
      }
      logger.info("logout actions", tokenRevocationResults);
      return tokenRevocationResults;
    })
  );
}
