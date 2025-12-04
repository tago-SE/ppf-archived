import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";
import { Payload, RequiredDataFromCollectionSlug } from "payload";

export const createChild = async (payload: Payload, {
    tenantId,
    parentId,
    slug,
    title,
    header,
    text,
    hero
} : {
    tenantId: string,
    parentId: string,
    slug: string,
    header: string,
    title: string,
    text: string,
    hero?: {
        type?: 'none' | 'lowImpact' | 'mediumImpact' | 'highImpact'
        title?: string,
        text?: string,
        media: string
    }
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
            pageTemplate: "standardPage",
            hero: {
                type: 'none',
                ...(hero ? {
                    type: hero.type,
                    richText: {
                        root: {
                            type: 'root',
                            children: [
                                {
                                    children: [
                                        {
                                            detail: 0,
                                            format: 0,
                                            mode: 'normal',
                                            style: '',
                                            text: hero.title,
                                            type: 'text',
                                            version: 1
                                        }
                                    ],
                                    direction: 'ltr',
                                    format: '',
                                    ident: 0,
                                    tag: 'h1',
                                    type: 'heading',
                                    version: 1,
                                },
                                {
                                    children: [
                                        {
                                            detail: 0,
                                            format: 0,
                                            mode: 'normal',
                                            style: '',
                                            text: hero.text,
                                            type: 'text',
                                            version: 1
                                        }
                                    ],
                                    direction: 'ltr',
                                    format: '',
                                    ident: 0,
                                    textFormat: 0,
                                    textStyle: '',
                                    type: 'paragraph',
                                    version: 1,
                                }
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            version: 1,
                        }
                    },
                    media: hero.media
                } : null)
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
                                size: 'full'
                            }]
                        }
                    ]
                }
            ],
        } as RequiredDataFromCollectionSlug<'pages'>
    });

    return await payload.update({
        collection: COLLECTION_SLUG_DYANMIC_PAGE,
        context: {
            disableRevalidate: true,
        },
        id: page.id,
        data: {
            parent: parentId
        }
    });
}