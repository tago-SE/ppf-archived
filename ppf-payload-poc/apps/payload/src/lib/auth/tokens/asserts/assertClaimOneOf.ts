import type { JWTPayload } from "jose";
import { z } from "zod";
import { assertClaimWithZodSchemaThrows } from "./assertClaimWithZodSchema";

/**
 * Assert that a string or an array of strings includes one of values.
 *
 * @param jwt
 * @param claim
 * @param oneOf
 */
export const assertClaimOneOfThrows = (
  jwt: JWTPayload,
  claim: string,
  oneOf: Array<string>
) => {
  const claimValue = jwt[claim];
  if (Array.isArray(claimValue)) {
    return assertClaimWithZodSchemaThrows(
      jwt,
      claim,
      z.preprocess(
        (arr) =>
          (arr as Array<string>).filter((arrValue: string) =>
            oneOf.includes(arrValue)
          ),
        z.array(z.string()).nonempty()
      )
    );
  }
  return assertClaimWithZodSchemaThrows(jwt, claim, z.enum(oneOf as [""]));
};
