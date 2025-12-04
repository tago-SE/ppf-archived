import { User } from "@/payload-types";
import { PayloadAdapterQueryConfigWithOptions } from "../types";
import { getUsersByClaims } from "./getUserByClaims";

export async function findUserByEmail(
  email: string,
  config: PayloadAdapterQueryConfigWithOptions
): Promise<User | null> {
  if (!email) return null;
  const users = await getUsersByClaims({ email }, config);
  if (users.length > 1) {
    throw new Error("Multiple users found.");
  }
  return users.at(0) ?? null;
}
