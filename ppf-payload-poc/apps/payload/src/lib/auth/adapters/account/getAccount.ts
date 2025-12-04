import { Payload } from "payload";
import { toAdapterAccount } from "./toAdapterAccount";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { getUserByAccount } from "../user/getUserByAccount";

export function createAdapterGetAccount(payload: Payload): Adapter["getAccount"] {
  return async (
    providerAccountId: AdapterAccount["providerAccountId"],
    provider: AdapterAccount["provider"]
  ) => {
    const payloadUser = await getUserByAccount(
      { provider, providerAccountId },
      { payload, options: { showHiddenFields: true } }
    );
    return toAdapterAccount(payloadUser, { provider, providerAccountId });
  };
}
