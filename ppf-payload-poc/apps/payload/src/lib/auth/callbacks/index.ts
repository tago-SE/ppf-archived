import Logger from "@/lib/logging";
import { NextAuthConfig } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { createSignInHandler } from "./handleSignIn";
import { createSessionHandler } from "./handleSession";

export { createSignInHandler, createSessionHandler };

interface NextAuthCallbacksOptions {
  logger?: Logger;
  adapter: Adapter;
}

export const creatAuthCallbacks = ({
  adapter,
  logger,
}: NextAuthCallbacksOptions) => {
  const { signIn } = createSignInHandler({ adapter, logger });
  const { session } = createSessionHandler({ adapter, logger: undefined });
  const callbacks: Pick<NextAuthConfig, "callbacks">["callbacks"] = {
    session,
    signIn,
  };
  return callbacks;
};
