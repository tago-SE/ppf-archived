import type { NextAuthConfig } from "next-auth";
import { CMS_LOGIN_GROUP_ID } from "../config";
import { isUserMemberOfGraphGroup } from "@/lib/msgraph";
import { randomUUID } from "crypto";
import { User } from "@/payload-types";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import Logger from "@/lib/logging";

interface SignInHandlerConfig {
  adapter: Adapter;
  logger?: Logger;
}

export const createSignInHandler = ({
  adapter,
  logger,
}: SignInHandlerConfig) => {
  return {
    /**
     * Controls whether a user is allowed to sign in or not. Returning true continues the sign-in flow.
     * Returning false or throwing an error will stop the sign-in flow and redirect the user to the error page
     * Returning a string will redirect the user to the specified URL.
     * */
    signIn: async ({ user, account, profile, ...rest }) => {
      const pid = randomUUID();
      const groupId = CMS_LOGIN_GROUP_ID;
      let redirectTo = "";
      if (!groupId) {
        redirectTo = `/auth/error?error=Configuration&groupId`;
        logger?.error(`signIn error - Invalid configuration for GroupId.`, {
          redirectTo,
          pid,
        });
        return redirectTo;
      }
      if (!user.email) {
        redirectTo = `/auth/error?error=Configuration&pid=${pid}&email`;
        logger?.error(`signIn error - User is missing required email.`, {
          redirectTo,
        });
        return redirectTo;
      }
      if (!(await isUserMemberOfGraphGroup(user.email, groupId))) {
        redirectTo = `/auth/error?error=AccessDenied&pid=${pid}`;
        logger?.info(
          `signIn denied - user does not belong to group '${groupId}'`,
          {
            pid,
            email: user.email,
            groupId,
          }
        );
        return redirectTo;
      }
      // Manually update the account if already existing previously to ensure fresh tokens
      const userId = user.id!;
      const existingUser = (await adapter.getUser!(userId)) as User | null;
      if (!!existingUser) {
        const accountToUpdate = {
          ...account,
          userId: user.id,
        } as AdapterAccount;
        await adapter.linkAccount!(accountToUpdate as AdapterAccount);
      }
      return true;
    },
  } satisfies Pick<NextAuthConfig, "callbacks">["callbacks"];
};
