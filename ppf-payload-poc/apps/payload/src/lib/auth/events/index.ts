import Logger from "@/lib/logging";
import { NextAuthConfig } from "next-auth";
import { Adapter } from "next-auth/adapters";

interface NextAuthEventsOptions {
  logger?: Logger;
}

export const NextAuthEvents = (options: NextAuthEventsOptions) => {
  if (!options?.logger) {
    return;
  }
  const _logger = options.logger;
  const nextAuthEvents: Pick<NextAuthConfig, "events">["events"] = {
    signOut: async (message) => {
      const {
        session,
      }: {
        session: Awaited<ReturnType<Required<Adapter>["deleteSession"]>>;
      } = message as any;

      _logger.info("signOut", session?.userId);
    },
    signIn: ({ user, profile, account, isNewUser }) => {
      _logger.info("signIn", { userId: user.id, isNewUser });
    },
    linkAccount: ({ user, account, profile }) => {
      const { id: userId } = user;
      const { provider, providerAccountId, type: accountType } = account;
      const { id: profileId } = profile;
      _logger.info(
        "linkAccount",
        { userId },
        { provider, providerAccountId, accountType },
        { profileId }
      );
    },
  };
  return nextAuthEvents;
};

export default NextAuthEvents;
