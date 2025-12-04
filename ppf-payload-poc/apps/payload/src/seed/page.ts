import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config"
import { Page } from "@/payload-types"
import { Payload } from "payload"

export const createPage = async (payload: Payload, {
    tenantId,
    slug,
    title,
    header,
    text,
    pageTemplate,
    products
} : {
    tenantId: string,
    slug: string,
    header: string,
    title: string,
    text: string,
    pageTemplate: Page['pageTemplate'],
    products?: Page['products'] 
}) => {
    const page = await payload.create({
        collection: COLLECTION_SLUG_DYANMIC_PAGE,
        context: {
            disableRevalidate: true,
        },
        data: {
            _status: 'published',
            tenant: tenantId,
            title,
            slug,
            pageTemplate,
            hero: {
                type: "none"
            },
            layout: [
                {
                    customBlocks: [
                        {
                            blockType: 'content',
                            blockName: 'Content block',
                            columns: [{
                                richText: {
                                    root: {
                                        type: 'root',
                                        children: [{
                                            type: 'heading',
                                            children: [
                                              {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: header,
                                                version: 1,
                                              },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            tag: 'h2',
                                            version: 1,
                                        }, {
                                            type: 'paragraph',
                                            children: [
                                                {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text,
                                                version: 1,
                                                },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            textFormat: 0,
                                            version: 1,
                                        }],
                                        direction: 'ltr',
                                        format: '',
                                        indent: 0,
                                        version: 1,
                                    }
                                },
                                size: 'full',
                            }]
                        }
                    ]
                }
            ],
            products
        },
        locale: 'en',
    });

    return page;
}