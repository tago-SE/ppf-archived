import type { Access, AccessArgs, PayloadRequest } from "payload";

/**
 * @deprecated Should be removed
 */
export const isOpenToPublic = async (checker: Access): Promise<boolean> => {
  return Promise.resolve(false);
  // TODO: This logic is not working and needs to be changed if any endpoints should be seen as publicly available
  // try {
  //   const result = await checker(
  //     new Proxy({} as unknown as AccessArgs, {
  //       get(target, p, receiver) {
  //         if (p === "req") {
  //           // If "req" is accessed
  //           throw new Error();
  //         }
  //         return Reflect.get(target, p, receiver);
  //       },
  //     })
  //   );
  //   return result === true;
  // } catch (error) {
  //   return false;
  // }
};
