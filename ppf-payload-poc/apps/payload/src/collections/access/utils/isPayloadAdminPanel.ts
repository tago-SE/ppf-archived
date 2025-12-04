import type { PayloadRequest } from "payload";

/**
 * Determines if a request is coming from the Payload admin panel
 *
 * @param req - The incoming Payload request
 * @returns {boolean} - True if the referer indicates the admin panel, otherwise false
 */
export const isPayloadAdminPanel = (
  req: PayloadRequest
): boolean => {
  const adminUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL!);
  return adminUrl.origin === req.origin;
};
