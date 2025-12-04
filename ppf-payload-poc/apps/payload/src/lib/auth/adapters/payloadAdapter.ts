import { Adapter, AdapterUser } from "next-auth/adapters";
import { Payload } from "payload";
import Logger from "@/lib/logging";
import { User } from "@/payload-types";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { NextAuthAdapterOptions } from "./abstractAdapter";
import { getPayloadWithConfig } from "@/lib/utils/getPayload";
import { DEBUG_AUTH_ADAPTER } from "../config";
import {
  createAdapterGetAccount,
  getUserLinkAccount,
  createLinkAccount,
  createUnlinkAccount,
} from "./account";
import {
  findUserByEmail,
  getUserById,
  ensureAdapterUser,
  getUserByAccount,
  deleteUserById,
} from "./user";
import {
  createSession,
  deleteSession,
  updateSession,
  getSessionAndUser,
} from "./session";

const logger = new Logger({ tags: ["auth", "adapter", "payload"] });

function CreatePayloadNextAuthAdapter(
  payload: Payload,
  options: NextAuthAdapterOptions
): Adapter {
  const debug = !!options.debug;
  return {
    // @ts-ignore
    createUser: async function (input: User | AdapterUser) {
      const userData = {
        ...input,
        password: crypto.randomUUID(),
      };
      if (debug) {
        console.log("createUser:input", input);
      }
      const createdUser = await payload.create({
        collection: COLLECTION_SLUG_USERS,
        // @ts-ignore
        data: userData,
      });
      if (debug) {
        logger.info("createdUser:success", {
          id: createdUser.id,
          email: createdUser.email,
        });
      }
      return ensureAdapterUser(createdUser);
    },
    // @ts-ignore
    getUser: async function (id: string) {
      const user = await getUserById(id, { payload });
      return user ? ensureAdapterUser(user) : null;
    },
    // @ts-ignore
    getUserByEmail: async function (email: string) {
      const user = await findUserByEmail(email, { payload });
      return user ? ensureAdapterUser(user) : null;
    },
    // @ts-ignore
    getUserByAccount: async function (args) {
      const user = await getUserByAccount(args, { payload });
      return user ? ensureAdapterUser(user) : null;
    },
    // @ts-ignore
    updateUser: async function (input) {
      const userId = input.id;
      Object.keys(input).forEach((key) => {
        if (
          !(options.fieldsUserIsAllowedToChange || []).includes(key) &&
          key in input
        ) {
          logger.info("updatteUser denied", key);
          // @ts-ignore
          // Log that key was not allowed to be changed
          delete input[key];
        }
      });
      const updatedUser = await payload.update({
        collection: COLLECTION_SLUG_USERS,
        id: userId,
        // @ts-ignore
        data,
      });
      if (!updatedUser) {
        throw new Error("PayloadAdapter: updateUser: no user found");
      }
      if (debug) {
        logger.info("updateUser", updatedUser);
      }
      return ensureAdapterUser(updatedUser);
    },
    linkAccount: createLinkAccount(payload, logger),
    // NOTE: Not used by nextauth internally
    unlinkAccount: createUnlinkAccount(payload, logger),
    createSession: async function (input) {
      return createSession(input, {
        payload,
        logger: debug ? logger : undefined,
      });
    },
    // @ts-ignore
    getSessionAndUser: async function (sessionToken: string) {
      return await getSessionAndUser(sessionToken, { payload });
    },
    updateSession: async function (session) {
      return updateSession(session, {
        payload,
        logger: debug ? logger : undefined,
      });
    },
    deleteSession: async function (sessionToken: string) {
      return deleteSession(sessionToken, {
        payload,
        logger: debug ? logger : undefined,
      });
    },
    createVerificationToken: async function (verificationToken) {
      const user = await findUserByEmail(verificationToken.identifier, {
        payload,
      });
      if (!user) {
        return null;
      }
      const updatedUser = await payload.update({
        collection: COLLECTION_SLUG_USERS,
        id: user.id,
        data: {
          verificationTokens: [
            ...(user?.verificationTokens || []),
            {
              identifier: verificationToken.identifier,
              token: verificationToken.token,
              expires: verificationToken.expires.toString(),
            },
          ],
        },
      });
      if (debug) {
        logger.info("createVeritificationToken", updatedUser);
      }
      return verificationToken;
    },
    deleteUser: async function (userId: string): Promise<void> {
      await deleteUserById(userId, { payload });
    },
    useVerificationToken: async function ({ identifier, token }) {
      const user = await findUserByEmail(identifier, { payload });
      if (!user) {
        return null;
      }
      const foundVerificationToken = (user.verificationTokens || []).find(
        (x) => x.token == token
      );
      if (!foundVerificationToken) {
        return null;
      }
      await payload.update({
        collection: COLLECTION_SLUG_USERS,
        id: user.id,
        data: {
          verificationTokens: [
            ...user.verificationTokens!.filter((x) => x.token != token),
          ],
        },
      });
      if (debug) {
        logger.info("useVeritificationToken:success", identifier, token);
      }
      return {
        identifier: identifier,
        token: token,
        expires: new Date(foundVerificationToken.expires!),
      };
    },
    getUserLinkAccount: function (userId) {
      return getUserLinkAccount(userId, { payload });
    },
    getAccount: createAdapterGetAccount(payload),
  } as Adapter;
}

export const getNextAuthAdapter = async () => {
  const payload = await getPayloadWithConfig();
  return CreatePayloadNextAuthAdapter(payload, {
    debug: DEBUG_AUTH_ADAPTER,
  });
};
