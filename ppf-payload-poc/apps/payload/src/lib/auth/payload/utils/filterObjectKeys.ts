export const filterObjectKeys = <T extends Record<string, any>>(
  obj: T,
  keysToRemove: (keyof T)[]
): Partial<T> => {
  const newObj = { ...obj }; // Create a shallow copy to avoid mutating the original object
  keysToRemove.forEach((key) => delete newObj[key]);
  return newObj;
};
