import { JobsConfig } from "payload";

export const jobs: JobsConfig = {
    tasks: [
        {
            slug: 'schedulePublish',
            outputSchema: [
                {
                    name: 'id',
                    type: 'text',
                    required: true,
                },
            ],
            handler: async ({ input, job, req }) => {
                const docId = input.doc.value;
                const rel = input.doc.relationTo;
                const { type, locale: publishSpecificLocale } = input;

                const result = await req.payload.update({
                    id: docId,
                    collection: rel,
                    data: {
                        _status: type === "publish" ? 'published' : 'draft'
                    },
                    draft: false,
                    req,
                    context: {
                        disableRevalidate: true,
                    },
                    publishSpecificLocale
                });

                return {
                    output: {
                        id: result.id
                    }
                };
            }
        }
    ],
    autoRun: [
        {
            cron: '*/1 * * * *',
            limit: 100,
        }
    ],
    shouldAutoRun: async (payload) => {
        return true
    },
}