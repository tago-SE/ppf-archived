import { findGraphGroupById } from "@/lib/msgraph";
import type { FieldHook } from "payload";
import { ValidationError } from "payload";

export const ensureMsGraphGroupExists: FieldHook = async ({
  value,
  operation,
  schemaPath,
}) => {
  if (!value || operation == "read" || operation == "delete") {
    return value;
  }
  try {
    const group = await findGraphGroupById(value);
    if (!group) {
      throw new ValidationError({
        errors: [
          {
            path: schemaPath.join("."),
            message: `No Microsoft Entra Group found matching '${value}'.`,
          },
        ],
      });
    }
  } catch (error: any) {
    const message = error?.message;
    if (message && message.includes("Invalid object identifier")) {
      throw new ValidationError({
        errors: [
          {
            path: schemaPath.join("."),
            message: `The provided ID '${value}' is not a valid Microsoft Entra Group identifier.`,
          },
        ],
      });
    }
    throw error;
  }
  return value;
};
