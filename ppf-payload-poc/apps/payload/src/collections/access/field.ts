const baseAccess = {
  always: () => true as true,
  never: () => false as false,
};

export const fieldAccess = {
  ...baseAccess,
};

export default fieldAccess;

/**
 * Generalized field access configuration for common scenarios.
 */
export const fieldAccessDefaults = {
  /**
   * The field can be edited but not created
   */
  updateOnly: {
    create: fieldAccess.never,
    update: fieldAccess.always,
  },
  /**
   * The field is only changeable during creation
   */
  createOnly: {
    create: fieldAccess.always,
    update: fieldAccess.never,
  },
  /**
   * This field can only be seen by everyone but never chaned, consider using admin.readOnly instead.
   */
  readOnly: {
    read: fieldAccess.always,
    update: fieldAccess.never,
    create: fieldAccess.never,
  },
};
