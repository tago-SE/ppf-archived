import configPromise from "@payload-config";
import { getPayload as _getPayload } from "payload";

export const getPayloadWithConfig = async () => {
  return await _getPayload({ config: configPromise });
};
