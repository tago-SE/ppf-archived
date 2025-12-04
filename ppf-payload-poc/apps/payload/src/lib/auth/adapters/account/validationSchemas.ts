import { AdapterAccount } from "next-auth/adapters";
import { z } from "zod";

/**
 * Account validation when updating account, such as after sign-in or when tokens are revoked
 */
export const updateAccountSchema = z.object({
  userId: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  expires_at: z.number(),
  type: z.enum(["oauth", "oidc", "email", "webauthn"]),
  access_token: z.string(),
  id_token: z.string().optional(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  scope: z.string().optional(),
}) satisfies z.ZodSchema<AdapterAccount>;

/**
 * Account validation to ensure that the account is active as in contains 'refresh_token', 'access_token', and 'id_token' etc.
 */
const validAccountSchema = z.object({
  userId: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  expires_at: z.number(),
  type: z.enum(["oauth", "oidc", "email", "webauthn"]),
  access_token: z.string(),
  id_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  scope: z.string(),
}) satisfies z.ZodSchema<AdapterAccount>;

export const validateAccountModelThrows = (input: unknown) =>
  validAccountSchema.parse(input);
