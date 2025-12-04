import type {
  AuthStrategy,
  AuthStrategyFunction,
  User as PayloadUser,
} from "payload";
import { COLLECTION_SLUG_USERS } from "@/collections/config";
import { User } from "@/payload-types";
import { payloadSession } from "../../payloadSession";
import { withNodeCache } from "@/lib/utils/cache/node_cache";
import { upsertAuthUser } from "./utils/upsertAuthUser";
import { filterObjectKeys } from "../../utils/filterObjectKeys";

const authStrategyName = "session";
const collection = COLLECTION_SLUG_USERS;
const sessionExcludedAuthFields: (keyof User)[] = [
  "curityClient",
  "verificationTokens",
];

const handler: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName = authStrategyName,
}) => {
  const session = await payloadSession({ headers });
  if (!session?.user) {
    return {
      user: null,
    };
  }
  const user = session.user as User;
  const existingUser = payload.findByID({
    id: user.id,
    collection: collection,
    disableErrors: true,
    showHiddenFields: false,
  });
  const payloadUser = await withNodeCache(
    () =>
      upsertAuthUser({
        payload,
        profile: user,
        createNewUser: false,
        allTenants: undefined,
        existingUser: existingUser,
      }),
    [strategyName, user.id],
    {
      revalidate: 10,
    }
  )();
  if (!payloadUser) {
    payload.logger.warn(
      { name: `AuthN (${strategyName})`, session },
      `User '${
        session.user.id ?? session.user.email
      }' has a valid session but does not exist in the payload database.`
    );
    return { user: null };
  }
  const filteredUser = filterObjectKeys(
    payloadUser!,
    sessionExcludedAuthFields
  );
  return {
    user: {
      _strategy: strategyName,
      collection: collection,
      ...filteredUser,
    } as PayloadUser,
  };
};

/**
 * Session
 *
 * @BasedOn https://github.com/CrawlerCode/payload-authjs/blob/main/packages/payload-authjs/src/payload/AuthjsAuthStrategy.ts
 */
export const authjsSessionStrategy: AuthStrategy = {
  name: authStrategyName,
  authenticate: handler,
};
