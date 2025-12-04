import type { Condition } from "payload";

export const hideFieldDuringCreation: Condition<any> = (data) => {
  return !!data?.id;
};
