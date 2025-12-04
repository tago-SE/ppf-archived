import type { FieldHook } from "payload";
import { ValidationError } from "payload";

/**
 * Ensures a field contains only valid characters.
 * @param regex The regular expression to validate the field's value against.
 * @param errorMessage Custom error message to return if validation fails.
 * @returns FieldHook A PayloadCMS FieldHook to validate the field.
 */
const ensureValidCharacters = (
  regex: RegExp,
  errorMessage: string = "This field contains invalid characters."
): FieldHook => {
  return async ({ data, value, operation, schemaPath }) => {
    if (operation === "read" || operation === "delete") {
      return value;
    }
    if (typeof value === "string" && !regex.test(value)) {
      throw new ValidationError({
        errors: [
          {
            path: schemaPath.join("."),
            message: errorMessage,
          },
        ],
      });
    }

    return value;
  };
};

export const onlyAlphanumericAndUnderscores = ensureValidCharacters(
  /^[a-zA-Z0-9_]+$/,
  "Field can only contain alphanumeric characters and underscores."
);

export const onlyAlphanumericUnderscoreAndSpace = ensureValidCharacters(
  /^[a-zA-Z0-9_ ]+$/,
  "Field can only contain alphanumeric characters, underscores, and spaces."
);
