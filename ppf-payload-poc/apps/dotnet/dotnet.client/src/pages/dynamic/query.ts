import { getTenant } from "../../utils/tenant";
import { getIsDraftMode, getPreview } from "../../utils/preview";
import { queryOptions } from "@tanstack/react-query";
import type { PageQuery, PageQueryVariables, LocaleInputType } from "./../../gql/generated";
import { gqlClient } from "../../utils/graphQLClient";

const capitalizeFirstKeepRest = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const pageQueryOptions = (slug: string, id: string, locale?: LocaleInputType, pageTemplate?: string | null) => {
    const tenant = getTenant();
    const isDraftMode = getIsDraftMode();

    return queryOptions({
        queryKey: ['pages', slug, locale],
        queryFn: async () => {
            const module = await import("./../../gql/pages.graphql");
            const queryKey = capitalizeFirstKeepRest(pageTemplate ?? "");
            const query = module[queryKey] ?? module["Page"];

            const preview = getPreview();
            if(preview && preview == id) {
                return {} as PageQuery['PagesByTenant'][];
            }

            const data = await gqlClient.fetch<PageQuery, PageQueryVariables>(query, {
                tenantSlug: tenant,
                pageSlug: slug,
                locale,
                draftMode: isDraftMode
            });

            // Finds data property
            const key = Object.keys(data).find(x => x.endsWith('ByTenant'));
            if(!key) {
                throw "Invalid response data";
            }

            return (data as Record<string, PageQuery['PagesByTenant']>)?.[key]?.docs;
        }
    })
}