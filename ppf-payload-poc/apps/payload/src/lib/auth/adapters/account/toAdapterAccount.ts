import { User } from "@/payload-types";
import { AdapterAccount, AdapterAccountType } from "next-auth/adapters";

export const toAdapterAccount = (
  user: User | null,
  args?: {
    provider: string;
    providerAccountId: string;
  }
) => {
  if (!args?.provider || !args?.providerAccountId) {
    return null;
  }
  const account = user?.accounts?.find(
    (x) =>
      x.provider == args.provider &&
      x.providerAccountId == args.providerAccountId
  );
  if (!account) {
    return null;
  }
  const parsedAccount: AdapterAccount = {
    userId: user!.id,
    provider: account.provider!,
    providerAccountId: account.providerAccountId!,
    type: account.type as AdapterAccountType,
    refresh_token: account.refresh_token!,
    access_token: account.access_token!,
    id_token: account.id_token!,
    expires_at: account.expires_at!,
    scope: account.scope!,
    session_state: account.session_state,
    token_type: account.token_type! as "bearer" | "dpop" | Lowercase<string>,
  };
  return parsedAccount;
};
