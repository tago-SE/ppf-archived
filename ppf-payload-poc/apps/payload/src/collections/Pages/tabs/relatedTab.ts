import { Tab } from "payload";
import { checkFieldExistsOnTemplate } from "../pageTemplate";
import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";
import { Page } from "@/payload-types";

export const relatedTab: Tab = {
    label: 'Related',
    name: 'related',
    admin: {
        condition: (data) => {
            return checkFieldExistsOnTemplate(data.pageTemplate, 'related')
        }
    },
    fields: [
        {
            type: 'text',
            name: 'heading',
            label: 'Related Content Heading',
            defaultValue: 'Related content',
            admin: {
              description: 'Heading to show above related content'
            },
            required: false
        },
        {
            name: 'relatedContent',
            type: 'relationship',
            filterOptions: ({ id, data, siblingData, req }) => {
                return {
                    id: {
                        not_in: [id],
                    },
                    tenant: {
                        equals: (data as Page).tenant
                    }
                }
            },
            hasMany: true,
            relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
        },
    ]
}