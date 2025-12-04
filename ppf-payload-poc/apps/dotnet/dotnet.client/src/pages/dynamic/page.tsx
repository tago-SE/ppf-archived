import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLoaderData } from "@tanstack/react-router";
import { useGetLocale } from "../../hooks/useGetLocale";
import { usePreview } from "../../hooks/usePreview";
import { lazy, useMemo } from "react";
import { Meta } from "../../components/cms/components/Meta";
import { pageQueryOptions } from "./query";
import { LocaleInputType, Page_PageTemplate } from "../../gql/generated";
import { PageDataType } from "../../types/common";

const templateMap = {
    applicationPage: lazy(() => import("./wrappers/wrappedApplicationPage")),
    articlePage: lazy(() => import("./wrappers/wrappedArticlePage")),
    documentationPage: lazy(() => import("./wrappers/wrappedDocumentationPage")),
    landingPage: lazy(() => import("./wrappers/wrappedLandingPage")),
    legalPage: lazy(() => import("./wrappers/wrappedLegalPage")),
    listPage: lazy(() => import("./wrappers/wrappedListPage")),
    productPage: lazy(() => import("./wrappers/wrappedProductPage")),
    showcasePage: lazy(() => import("./wrappers/wrappedShowcasePage")),
    standardPage: lazy(() => import("./wrappers/wrappedStandardPage"))
}

const LazyFallbackPage = lazy(() => import("./wrappers/wrappedFallbackPage"))

function PageComponent({ data, pageTemplate }: { data?: PageDataType, pageTemplate?: Page_PageTemplate }) {
    const page = useMemo(() => data as PageDataType, [data]);
    const template = page?.pageTemplate ?? pageTemplate
    const PageComponent = template ? templateMap[template] ?? LazyFallbackPage : LazyFallbackPage

    return <>
        <Meta meta={page?.meta} />
        {page?.breadcrumbs?.length && page?.breadcrumbs?.length > 1 ? 
        <div className="breadcrumbs text-sm p-5">
            <ul>   
                {page?.breadcrumbs?.map(b => b.doc ? (<li key={b.doc.id}><Link to={b.url?.replace('/home', '/')}>{b.doc.title}</Link></li>) : null)}
            </ul>
        </div> : null}
        <PageComponent data={data} />
    </>
}

export function Pages() {
    const { slug = 'home', pageTemplate, id } = useLoaderData({ strict: false }) || {};
    const locale = useGetLocale() as LocaleInputType;
    const query = useSuspenseQuery(pageQueryOptions(slug, id, locale, pageTemplate));
    const { data } = usePreview({ incommingData: query.data?.[0] as PageDataType, id });

    return <PageComponent data={data} pageTemplate={pageTemplate} />
}

export default Pages;