import { useMemo } from "react";
import { Sitemap } from "../types/sitemap";
import { useAppContext } from "./useAppContext";

export function getPageMeta(idSlug: string, sitemap?: Sitemap) {
    return sitemap?.find(x => x?.slug == idSlug || x?.id == idSlug);
}

export function usePageTemplate(slug: string) {
    const { sitemap } = useAppContext();
    const pageTemplate = useMemo(() => {
        return getPageMeta(slug, sitemap)?.pageTemplate
    }, [sitemap, slug]);

    return pageTemplate;
}