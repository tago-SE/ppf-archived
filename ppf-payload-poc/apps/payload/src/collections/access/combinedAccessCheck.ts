/*
 * ! NOTICE !
 *
 * This needs to be tested for what happens when using Where query instead of boolean results.
 */
import type { Access, FieldAccess } from "payload";

function createAccessOrCheck(...accessCheckers: Access[]): Access {
  return async (args) => {
    try {
      return await Promise.any(
        accessCheckers.map(async (checker) => {
          const result = await checker(args);
          if (!result) throw new Error("Access Denied");
          return true;
        })
      );
    } catch {
      return false;
    }
  };
}

function createFieldAccessOrCheck(
  ...accessCheckers: FieldAccess[]
): FieldAccess {
  return async (args) => {
    try {
      return await Promise.any(
        accessCheckers.map(async (checker) => {
          const result = await checker(args);
          if (!result) throw new Error("Access Denied");
          return true;
        })
      );
    } catch {
      return false;
    }
  };
}

function createAccessAndCheck(...accessCheckers: Access[]): Access {
  return async (args) => {
    const results = await Promise.all(
      accessCheckers.map((checker) => checker(args))
    );
    return results.length > 0 && results.every(Boolean);
  };
}

function createFieldAccessAndCheck(
  ...accessCheckers: FieldAccess[]
): FieldAccess {
  return async (args) => {
    const results = await Promise.all(
      accessCheckers.map((checker) => checker(args))
    );
    return results.length > 0 && results.every(Boolean);
  };
}

/**
 * Combined access check utilities for `or` (at least one condition must pass)
 * and `and` (all conditions must pass).
 */
export const combinedAccessCheck = {
  or: {
    /**
     * Checks if at least one of the given `Access` functions grants access.
     * Resolves `true` if any function passes, otherwise returns `false`.
     *
     * @param accessCheckers - Array of `Access` functions to evaluate.
     * @returns A new `Access` function that returns `true` if at least one checker passes.
     */
    access: createAccessOrCheck,
    /**
     * Checks if at least one of the given `FieldAccess` functions grants access.
     * Resolves `true` if any function passes, otherwise returns `false`.
     *
     * @param accessCheckers - Array of `FieldAccess` functions to evaluate.
     * @returns A new `FieldAccess` function that returns `true` if at least one checker passes.
     */
    fieldAccess: createFieldAccessOrCheck,
  },
  and: {
    /**
     * Checks if all given `Access` functions grant access.
     * Resolves `true` only if every function passes, otherwise returns `false`.
     *
     * @param accessCheckers - Array of `Access` functions to evaluate.
     * @returns A new `Access` function that returns `true` only if all checkers pass.
     */
    access: createAccessAndCheck,
    /**
     * Checks if all given `FieldAccess` functions grant access.
     * Resolves `true` only if every function passes, otherwise returns `false`.
     *
     * @param accessCheckers - Array of `FieldAccess` functions to evaluate.
     * @returns A new `FieldAccess` function that returns `true` only if all checkers pass.
     */
    fieldAccess: createFieldAccessAndCheck,
  },
};
