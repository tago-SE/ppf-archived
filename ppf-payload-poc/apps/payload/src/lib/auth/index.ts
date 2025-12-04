import NextAuth, { NextAuthResult } from "next-auth";
import { type NextAuthConfig } from "next-auth";
import { strToBoolean } from "@/lib/utils/strToBoolean";
import Logger from "../logging";
import { getNextAuthAdapter } from "./adapters/payloadAdapter";
import { creatAuthCallbacks } from "./callbacks";
import NextAuthEvents from "./events/index";
import { pageRoutes } from "@/routes";
import { nextAuthSessionConfig, USE_SECURE_AUTHJS_COOKIES } from "./config";
import { providers } from "./providers";

const debug = strToBoolean(process.env.NEXTAUTH_DEBUG) || false;

const baseAuthConfig = {
  pages: {
    signIn: pageRoutes.AdminLogin.pathname,
    error: pageRoutes.AdminError.pathname,
    // verifyRequest
    // signOut: "signout",
    newUser: undefined,
  },
  secret: process.env.PAYLOAD_SECRET,
  providers: providers,
  session: nextAuthSessionConfig,
  useSecureCookies: USE_SECURE_AUTHJS_COOKIES,
  debug: debug,
  events: NextAuthEvents({
    logger: new Logger({ tags: ["auth", "events"] }),
  }),
} satisfies NextAuthConfig;

export const {
  handlers,
  auth,
  signIn,
  signOut: _signOut,
} = NextAuth(async () => {
  const adapter = await getNextAuthAdapter();
  const config: NextAuthConfig = {
    ...baseAuthConfig,
    adapter: adapter,
    callbacks: creatAuthCallbacks({
      logger: new Logger({ tags: ["auth", "callbacks"] }),
      adapter,
    }),
  };
  return config;
});

export const signOut: Pick<NextAuthResult, "signOut">["signOut"] = (args) => {
  // if (!adapterInstance?.getAccount) {
  //   // this is sometimes not defined so this approach is wrong
  //   throw new Error("adapterInstance.getAccount is missing");
  // }
  // const providerName = OktaProviderName;
  // const session = await auth();
  // const providerAccountId = "123123";
  // const account = await adapterInstance.getAccount(
  //   providerAccountId,
  //   providerName
  // );
  // console.log("SESS", session);
  // const account = await adapterInstance?.getAccount();
  // await fetch('/api/auth/federated-logout/', { mode: 'no-cors' });
  return _signOut(args);
};
