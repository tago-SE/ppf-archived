import type { FieldHook } from "payload";

import { ValidationError } from "payload";

/**
 * Compares the last field slug in the schemaPath with others and ensures that it is unique
 */
export const ensureUniqueFieldInArray: FieldHook = async ({
  data,
  value,
  operation,
  schemaPath,
}) => {
  // TODO: May need to be refactoed and use payload.find query can also perhaps be entierly combined with ensureUniqueField
  if (operation == "read" || operation == "delete") {
    return value;
  }
  let fieldPath = schemaPath;
  const valueFieldName = schemaPath[schemaPath.length - 1];
  let currentValue = data as unknown as any;
  for (let segment of fieldPath) {
    if (currentValue[segment]) {
      currentValue = currentValue[segment];
    }
  }
  if (Array.isArray(currentValue)) {
    const found = currentValue
      .map((x: { [segment: string]: any }) => x[valueFieldName])
      .filter((x: any) => x == value);
    if (found.length > 1) {
      throw new ValidationError({
        errors: [
          {
            path: schemaPath.join("."),
            message: `Value '${value}' already exists.`,
          },
        ],
      });
    }
  }
  return value;
};
