import { COLLECTION_SLUG_CATEGORIES } from "@/collections/config";
import { Payload } from "payload"

export const createCategory = async (payload: Payload, {
    title,
    tenantId
} : {
    title: string,
    tenantId: string,
}) => {
    return await payload.create({
        collection: COLLECTION_SLUG_CATEGORIES,
        data: {
            title,
            tenant: tenantId
        },
    });
}