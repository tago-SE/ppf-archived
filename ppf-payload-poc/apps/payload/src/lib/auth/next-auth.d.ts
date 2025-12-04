import { User } from "@/payload-types";
import {
  AdapterSession,
  AdapterUser,
  Adapter as NextAuthAdapter,
} from "next-auth/adapters";

import { Adapter, AdapterAccount } from "next-auth/adapters";
import { DefaultSession as NextAuthSession } from "next-auth";

type AccountRefreshAccessTokenArgs = Pick<
  AdapterAccount,
  | "provider"
  | "providerAccountId"
  | "access_token"
  | "expires_at"
  | "refresh_token"
  | "expires_in"
>;

declare module "next-auth/adapters" {
  type AdapterUser = User;

  interface Adapter extends NextAuthAdapter {
    /**
     * Get current account from last sign-in
     *
     * @param userId
     */
    getUserLinkAccount(userId: string): Awaitable<AdapterAccount | null>;
  }
}

declare module "@auth/core/adapters" {
  type AdapterUser = User;
}

type SessionError = {
  code: string;
  message?: string;
  /**
   * The process ID for the NextAuth sessions callback available in the logs.
   */
  pid: string;
};

// declare module "next-auth" {
//   // interface Session extends NextAuthSession {
//   //   sessionToken?: string;
//   //   user?: User;
//   //   error?: SessionError;
//   // }
// }
