import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useDebounceValue, useEventCallback, useEventListener } from "usehooks-ts";
import { cx } from "class-variance-authority";
import { CMSLink } from "./CMSLink";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { Search as SearchGqlQuery } from "./../../../gql/search.graphql"
import { SearchQuery, SearchQueryVariables } from "../../../gql/generated";
import { gqlClient } from "../../../utils/graphQLClient";
import { CMSLinkType } from "@ppf/payload-renderer";

type SearchProps = {
    className?: string
}

export function Search(props: SearchProps) {
    const locale = useGetLocale();
    const ref = useRef<HTMLInputElement>(null)

    const [debouncedValue, setDebauncedValue] = useDebounceValue<string | null | undefined>(null, 500)
    const [searchValue, setSearchValue] = useState<string | undefined | null>();

    const handleSearchChange = useEventCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setDebauncedValue(e.target.value);
    });
  
    useEventListener('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        ref.current?.focus();
      }
    });
  
    const query = useQuery({
      queryKey: ['search', locale, debouncedValue],
      queryFn: async () => {
        const data = await gqlClient.fetch<SearchQuery, SearchQueryVariables>(SearchGqlQuery, {
            tenantSlug: import.meta.env.VITE_TENANT_SLUG,
            term: debouncedValue ?? "",
            locale
        });
  
        return data;
      },
      enabled: !!debouncedValue
    });

    const clickHandler = useEventCallback(() => {
        ref.current?.blur();
        setSearchValue(null);
        setDebauncedValue(null);
    });
  
    return (
        <div className={cx("dropdown", props.className)}>
            <span className="material-symbols-light--warning-outline"></span>
            <label tabIndex={0}  className="input flex items-center gap-2">
                <span className="icon-[material-symbols-light--search-rounded] w-10 h-10 opacity-70"></span>
                <input type="search" className="grow" placeholder="Search" onChange={handleSearchChange} ref={ref} value={searchValue ?? ''} />
                <kbd className="kbd kbd-sm mt-[2px]">ctrl</kbd>
                <kbd className="kbd kbd-sm mt-[2px]">K</kbd>
            </label>
            {debouncedValue ? (
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
                {query.isLoading ? <div className="px-4 py-2 flex items-center">
                    <span className="loading loading-dots loading-sm"></span>
                </div> : null}
                {query.data?.SearchByTenant?.docs && query.data?.SearchByTenant?.docs.length > 0 ? 
                    query.data?.SearchByTenant?.docs.filter(x => !!x).map(d => (<li key={d.id}><CMSLink onClick={clickHandler} reference={d.doc as unknown as CMSLinkType['reference']} type={"reference"}>{d.title}</CMSLink></li>)) :
                    !query.isLoading ? <span className="px-4 py-2">Nothing found</span> : null
                }
                </ul>
            ) : null}
        </div>
    )
  }