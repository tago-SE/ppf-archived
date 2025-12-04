import type { Field } from "payload";

/**
 * Get user attributes from a user object based on the fields
 *
 * @param user User object
 * @param fields Fields to get from the user object
 * @returns Object with specified fields from the user object
 */
export const getUserAttributes = <T>(user: T, fields: Field[]) => {
  return fields.reduce((acc: Partial<T>, field) => {
    if ("name" in field) {
      const val = user[field.name as keyof T] as unknown as any;
      acc[field.name as keyof T] = val;
    }
    return acc;
  }, {});
};
