import type { Adapter } from "next-auth/adapters";

export interface NextAuthAdapterOptions {
  fieldsUserIsAllowedToChange?: string[];
  debug?: boolean;
}

/**
 * Template Auth adappter where the stub methods will throw when used.
 *
 */
export function AbstractNextAuthAdapter(
  options: NextAuthAdapterOptions
): Adapter {
  return {
    getUserLinkAccount: async function () {
      throw new Error("Not implemented");
    },
    createUser: async function () {
      throw new Error("Not implemented");
    },
    getUser: async function () {
      throw new Error("Not implemented");
    },
    getUserByEmail: async function () {
      throw new Error("Not implemented");
    },
    getUserByAccount: async function () {
      throw new Error("Not implemented");
    },
    updateUser: async function () {
      throw new Error("Not implemented");
    },
    deleteUser: async function () {
      throw new Error("Not implemented");
    },
    linkAccount: async function () {
      throw new Error("Not implemented");
    },
    unlinkAccount: async function () {
      throw new Error("Not implemented");
    },
    createSession: async function () {
      throw new Error("Not implemented");
    },
    getSessionAndUser: async function () {
      throw new Error("Not implemented");
    },
    updateSession: async function () {
      throw new Error("Not implemented");
    },
    deleteSession: async function () {
      throw new Error("Not implemented");
    },
    createVerificationToken: async function () {
      throw new Error("Not implemented");
    },
    useVerificationToken: async function () {
      throw new Error("Not implemented");
    },
    getAccount: function () {
      throw new Error("Not implemented");
    },
    getAuthenticator: async function () {
      throw new Error("Not implemented");
    },
    createAuthenticator: async function () {
      throw new Error("Not implemented");
    },
    listAuthenticatorsByUserId: async function () {
      throw new Error("Not implemented");
    },
  };
}
