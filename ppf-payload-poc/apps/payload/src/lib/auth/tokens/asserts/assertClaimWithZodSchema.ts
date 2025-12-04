import type { JWTPayload } from "jose";
import { z } from "zod";
import { JWTClaimValidationFailed } from "jose/errors";

type JWTZodSchemaValidationResult<T> = {
  /**
   * parsed claim value
   */
  result: T;
  success: boolean;
  error?: JWTClaimValidationFailed;
};
/**
 * Validates a specific claim in a JWT payload using the provided Zod schema.
 *
 * If the claim is missing, returns an object with success set to false.
 * If the claim exists but fails validation, a JWTClaimValidationFailed error is thrown.
 *
 * @param jwt - The JWT payload.
 * @param claim - The claim key to validate.
 * @param schema - A Zod schema used to validate the claim's value.
 * @returns An object with { success: true, result } if the claim exists and passes validation,
 *          or { success: false, error } if the claim is missing.
 *
 * @throws JWTClaimValidationFailed if the claim exists but fails validation.
 */
export function assertClaimWithZodSchemaThrows<T>(
  jwt: JWTPayload,
  claim: string,
  schema: z.ZodType<T>
): JWTZodSchemaValidationResult<T> {
  try {
    let usedSchema = schema;
    // Check if the schema is a number schema and wrap it with a preprocessing step to make sure it can handle incoming string numbers "5" --> 5
    if (schema instanceof z.ZodNumber) {
      usedSchema = z.preprocess(
        (val) => (!isNaN(Number(val)) ? Number(val) : val),
        schema
      ) as unknown as z.ZodType<T>;
    }
    const value = jwt[claim];
    const parsedValue = usedSchema.parse(value);
    return { success: true, result: parsedValue };
  } catch (e) {
    throw new JWTClaimValidationFailed(
      `Claim "${claim}" failed validation: ${(e as Error).message}`,
      jwt,
      claim,
      "schema_validation_check_failed"
    );
  }
}

/**
 * Validates a specific claim in a JWT payload using the provided Zod schema.
 */
export function assertClaimWithZodSchema<T>(
  jwt: JWTPayload,
  claim: string,
  schema: z.ZodType<T>
): JWTZodSchemaValidationResult<T | undefined> {
  try {
    return assertClaimWithZodSchemaThrows(jwt, claim, schema);
  } catch (error) {
    return {
      success: false,
      result: undefined,
      error: error as JWTClaimValidationFailed,
    };
  }
}
