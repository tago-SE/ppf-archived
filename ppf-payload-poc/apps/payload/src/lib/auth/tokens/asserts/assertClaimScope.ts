import type { JWTPayload } from "jose";
import { assertClaimWithZodSchemaThrows } from "./assertClaimWithZodSchema";
import { z } from "zod";

export const assertClaimHasRequiredScopeThrows = (
  jwt: JWTPayload,
  claim: string,
  requiredScopes: Array<string>
) => {
  return assertClaimWithZodSchemaThrows(
    jwt,
    claim,
    z.preprocess(
      (val) => (typeof val === "string" ? val.split(" ") : val),
      z.array(z.string()).superRefine((scopes, ctx) => {
        const missingScopes = requiredScopes.filter(
          (scope) => !scopes.includes(scope)
        );
        if (missingScopes.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              process.env.NODE_ENV === "development"
                ? `Missing required scopes: '${missingScopes.join(" ")}'.`
                : "Missing required scopes.",
          });
        }
      })
    )
  );
};
