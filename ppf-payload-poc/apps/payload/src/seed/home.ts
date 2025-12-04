import { COLLECTION_SLUG_DYANMIC_PAGE, COLLECTION_SLUG_REUSABLE_BLOCKS } from "@/collections/config";
import { Payload, RequiredDataFromCollectionSlug } from "payload";

export const createHome = async (payload: Payload, {
    tenantId,
    tenantName,
    media,
    video,
    pdf,
    uploadImg,
    reusableBlocks
} : {
    tenantId: string,
    tenantName: string,
    media: [string, string, string]
    video: string,
    pdf: string,
    uploadImg: string,
    reusableBlocks?: string[]
}) => {
    const page = await payload.create({
        collection: COLLECTION_SLUG_DYANMIC_PAGE,
        context: {
            disableRevalidate: true,
        },
        data: {
            tenant: tenantId,
            slug: 'home',
            title: 'Home',
            _status: 'published',
            pageTemplate: "landingPage",
            hero: {
                type: 'lowImpact',
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
                                        text: `Welcome to portal of ${tenantName}`,
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
                                        text: `This is low impact hero with no links and background image`,
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
                }
            },
            layout: [
                {
                    customBlocks: [
                        {
                            blockType: 'content',
                            blockName: 'Content block to present link to PDF file',
                            columns: [{
                                richText: {
                                    root: {
                                        type: 'root',
                                        children: [{
                                            type: 'paragraph',
                                            children: [
                                                {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'Here’s a direct link to the media, which can be used to include downloadable files.',
                                                version: 1,
                                                },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            textFormat: 0,
                                            version: 1,
                                        }, {
                                            type: 'upload',
                                            value: pdf,
                                            fields: null,
                                            format: "",
                                            version: 3,
                                            relationTo: "media"
                                        }, {
                                            type: 'paragraph',
                                            children: [
                                                {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'This is Reusable Block referenced from rich text box',
                                                version: 1,
                                                },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            textFormat: 0,
                                            version: 1,
                                        },
                                        ...reusableBlocks?.map(x => ({
                                            type: 'relationship',
                                            relationTo: COLLECTION_SLUG_REUSABLE_BLOCKS,
                                            version: 2,
                                            value: x
                                        })) ?? []
                                    ],
                                        direction: 'ltr',
                                        format: '',
                                        indent: 0,
                                        version: 1,
                                    }
                                }
                            }]
                        },                  
                    ]
                },
                {
                    customBlocks: [
                        {
                            media: video,
                            blockType: 'mediaBlock',
                            blockName: 'Sample video',
                        },
                    ]
                },
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
                                                text: 'Full width content',
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
                                                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget augue in nibh vehicula placerat. Quisque in accumsan libero, a varius arcu.',
                                                version: 1,
                                                },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            textFormat: 0,
                                            version: 1,
                                        }, {
                                            type: 'block',
                                            fields: {
                                                blockType: 'code',
                                                code: `function printLabel(labeledObj: { label: string }) {\n\tconsole.log(labeledObj.label);\n}`,
                                                language: 'typescript'
                                            },
                                            format: '',
                                            version: 2
                                        }, {
                                            type: 'link',
                                            children: [{
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'External link to Github',
                                                version: 1
                                            }],
                                            direction: 'ltr',
                                            fields: {
                                                linkType: 'custom',
                                                newTab: true,
                                                url: 'https://github.com'
                                            },
                                            format: '',
                                            indent: 0,
                                            version: 3
                                        }, {
                                            type: 'block',
                                            fields: {
                                                blockType: 'mediaBlock',
                                                media: media[0]
                                            },
                                            format: '',
                                            version: 2
                                        }],
                                        direction: 'ltr',
                                        format: '',
                                        indent: 0,
                                        version: 1,
                                    }
                                },
                                size: 'full',
                                enableLink: true,
                                link: {
                                    label: 'Default link',
                                    appearance: "default",
                                    type: "custom",
                                    url: 'https://github.com'
                                }
                            }, {
                                size: "half",
                                enableLink: true,
                                link: {
                                    label: 'Default link',
                                    appearance: "default",
                                    type: "custom",
                                    url: 'https://github.com'
                                },
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
                                                text: 'Content 1/2 width',
                                                version: 1,
                                            },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            tag: 'h2',
                                            version: 1,
                                        }, {
                                            type: 'block',
                                            fields: {
                                                blockType: 'mediaBlock',
                                                media: media[1]
                                            },
                                            format: '',
                                            version: 2
                                        }, {
                                            type: 'paragraph',
                                            children: [
                                                {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget augue in nibh vehicula placerat. Quisque in accumsan libero, a varius arcu.',
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
                                }
                            }, {
                                size: "half",
                                enableLink: true,
                                link: {
                                    label: 'Outline link',
                                    appearance: "outline",
                                    type: "custom",
                                    url: 'https://github.com'
                                },
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
                                                text: 'Content 1/2 width',
                                                version: 1,
                                            },
                                            ],
                                            direction: 'ltr',
                                            format: '',
                                            indent: 0,
                                            tag: 'h2',
                                            version: 1,
                                        }, {
                                            type: 'block',
                                            fields: {
                                                blockType: 'mediaBlock',
                                                media: media[2]
                                            },
                                            format: '',
                                            version: 2
                                        }, {
                                            type: 'paragraph',
                                            children: [
                                                {
                                                type: 'text',
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget augue in nibh vehicula placerat. Quisque in accumsan libero, a varius arcu.',
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
                                }
                            }]
                        },
                    ]
                },
                {
                    customBlocks: [
                        {
                            media: uploadImg,
                            blockType: 'mediaBlock',
                            blockName: 'Sample photo from uploads',
                        }  
                    ]
                },
                ...reusableBlocks?.map(x => ({
                    useLinkedBlock: true,
                    linkedBlock: x
                })) ?? []
            ]
        } as RequiredDataFromCollectionSlug<'pages'>,
        locale: 'en'
    });

    return page;
}