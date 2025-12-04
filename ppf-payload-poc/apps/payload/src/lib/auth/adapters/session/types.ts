import type { AdapterSession, AdapterUser } from "next-auth/adapters";

export type GetSessionAndUserResult = {
  session: AdapterSession;
  user: AdapterUser;
} | null;

export type DeleteSessionResult = AdapterSession | null;

export type UpdateSessionResult = AdapterSession | undefined | null;
