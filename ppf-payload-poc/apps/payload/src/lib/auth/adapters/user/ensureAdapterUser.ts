import type { AdapterUser } from "next-auth/adapters";
import type { User } from "@/payload-types";

export const ensureAdapterUser = (user: User): AdapterUser => {
  return {
    ...user,
    // @ts-ignore
    email: user.email,
    id: user.id,
    name: user.name,
    image: user.image,
    // @ts-ignore
    emailVerified: user?.emailVerified ? new Date(user.emailVerified) : null,
  };
};
