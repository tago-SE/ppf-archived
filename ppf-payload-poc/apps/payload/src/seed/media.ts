import { COLLECTION_SLUG_MEDIA } from "@/collections/config";
import { File, Payload, RequiredDataFromCollectionSlug } from "payload";
import { Media } from "@/payload-types";

export const createMedia = async (payload: Payload, {
    tenantId,
    mediaSource,
    externalUrl,
    externalThumbnailURL,
    file,
    alt,
    caption
} : {
    tenantId: string,
    mediaSource: string,
    externalUrl?: string,
    externalThumbnailURL?: string,
    file?: File,
    alt?: string,
    caption?: Media['caption']
}) => {
    const page = await payload.create({
        collection: COLLECTION_SLUG_MEDIA,
        context: {
            disableRevalidate: true,
        },
        data: {
            tenant: tenantId,
            mediaSource,
            ...(mediaSource != "upload" ? {
                externalUrl,
                externalThumbnailURL
            } : undefined),
            mimeType: '',
            alt,
            caption
        } as RequiredDataFromCollectionSlug<'media'>,
        file: mediaSource != "upload" ? {
            data: Buffer.alloc(0),
            mimetype: "text/plain",
            name: "dummy",
            size: 0
        } : file,
    });

    return page;
}