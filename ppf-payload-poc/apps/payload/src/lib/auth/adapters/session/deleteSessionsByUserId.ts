import { COLLECTION_SLUG_SESSIONS } from "@/collections/config";

import { PayloadAdapterBaseQueryConfig } from "../types";

export async function deleteSessionsByUserId(
  userId: string,
  { payload, logger }: PayloadAdapterBaseQueryConfig
): Promise<number> {
  if (!userId) {
    return 0;
  }
  try {
    const { docs: sessions } = await payload.delete({
      collection: COLLECTION_SLUG_SESSIONS,
      where: {
        "user.id": {
          equals: userId,
        },
      },
    });
    logger?.info("deleteSessionsByUserId - OK", {
      deletedCount: sessions.length,
      userId: userId,
    });
    return sessions.length;
  } catch (error) {
    logger?.error("deleteSessionsByUserId - error", error);
    return 0;
  }
}
