import { useRouter } from "@tanstack/react-router";
import { LocaleInputType } from "../gql/generated";
import { LocationSearchParams } from "../types/common";

export function getLocale(locale?: LocaleInputType, override?: LocaleInputType) {
    return override ?? locale;
}

export function useGetLocale() {
    const router = useRouter();
    const ctxLocale = router.options.context.locale as LocaleInputType | undefined;
    const searchLocale = (location.search as LocationSearchParams)?.l as LocaleInputType | undefined;
    return getLocale(ctxLocale, searchLocale);
}