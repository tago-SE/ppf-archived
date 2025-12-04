import { useLayoutEffect, useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  notFound,
  RouterProvider,
} from "@tanstack/react-router";
import { getLocale } from "./hooks/useGetLocale";
import { RootLayout } from "./pages/layouts.tsx";
import { gqlClient } from "./utils/graphQLClient.ts";
import ErrorPage from "./pages/500.tsx";
import NotFoundPage from "./pages/404.tsx";
import { CodeBlock } from "./components/cms/blocks/CodeBlock.tsx";
import { ContentBlock } from "./components/cms/blocks/ContentBlock.tsx";
import { CMSLink } from "./components/cms/components/CMSLink.tsx";
import { Button } from "./components/cms/components/Button/index.tsx";
import { RichText } from "./components/cms/components/RichText.tsx";
import { RenderContext } from "@ppf/payload-renderer";
import AppContext from "./context/AppContext.tsx";
import { Initial } from "./gql/initial.graphql";
import { LowImpactHero } from "./components/cms/components/Hero/LowImpact.tsx";
import { MediumImpactHero } from "./components/cms/components/Hero/MediumImpact.tsx";
import { HighImpactHero } from "./components/cms/components/Hero/HighImpact.tsx";
import { Tenant } from "@ppf/payload-renderer/payload-types";
import { MediaBlock } from "./components/cms/blocks/MediaBlock.tsx";
import { getTenant } from "./utils/tenant.ts";
import { Loading } from "./components/loading.tsx";
import { getPageMeta } from "./hooks/usePageTemplate.ts";
import { Sitemap } from "./types/sitemap.ts";
import {
  InitialQuery,
  InitialQueryVariables,
  LocaleInputType,
} from "./gql/generated.ts";
import { Pages } from "./pages/dynamic/page.tsx";
import { pageQueryOptions } from "./pages/dynamic/query.ts";
import { dynamicCollectionName, indexPageSlug, pathToPageTypeMap } from "../const.ts";
import { getIsDraftMode } from "./utils/preview.ts";
import { LocationSearchParams } from "./types/common.ts";


const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
  locale?: LocaleInputType;
  sitemap: Sitemap;
}>()({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: async ({
    context: { queryClient, locale: ctxLocale, sitemap },
    location,
  }) => {
    const locale = getLocale(ctxLocale, (location.search as LocationSearchParams)?.l);
    const meta = getPageMeta(indexPageSlug, sitemap);

    if(!meta?.id) {
      throw notFound();
    }

    const data = await queryClient.ensureQueryData(
      pageQueryOptions(indexPageSlug, meta.id, locale, meta?.pageTemplate)
    );

    if (!data || data?.length === 0) {
      throw notFound();
    }

    return {
      id: meta?.id,
      slug: meta?.slug,
      pageTemplate: meta?.pageTemplate,
      collection: dynamicCollectionName,
      data,
    };
  },
  component: Pages,
});

const dynamicPage = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$dynamicSlug",
  loader: async ({
    params: { dynamicSlug },
    context: { locale: ctxLocale, sitemap },
  }) => {
    const pureId = dynamicSlug.split("?")[0];
    const locale = getLocale(ctxLocale, (location.search as LocationSearchParams)?.l);
    const meta = getPageMeta(dynamicSlug, sitemap);

    if(!meta?.id) {
      throw notFound();
    }

    const data = await queryClient.ensureQueryData(
      pageQueryOptions(pureId, meta.id, locale, meta?.pageTemplate)
    );
    if (!data || data?.length === 0) {
      throw notFound();
    }

    return {
      id: meta?.id,
      slug: meta?.slug,
      pageTemplate: meta?.pageTemplate,
      data,
    };
  },
  component: Pages,
  preload: true,
});

const dynamicCollection = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$dynamicCollection/$slug",
  loader: async ({
    params: { dynamicCollection, slug },
    context: { locale: ctxLocale, sitemap },
  }) => {
    const baseId = slug.split("?")[0];
    const locale = getLocale(ctxLocale, (location.search as LocationSearchParams)?.l);
    const meta = getPageMeta(baseId, sitemap);

    if(!meta?.id) {
      throw notFound();
    }

    if (!Object.values(pathToPageTypeMap).includes(dynamicCollection)) {
      throw notFound();
    }

    const data = await queryClient.ensureQueryData(
      pageQueryOptions(baseId, meta.id, locale, meta?.pageTemplate)
    );
    if (!data || data?.length === 0) {
      throw notFound();
    }

    return {
      id: meta?.id,
      slug: meta?.slug,
      pageTemplate: meta?.pageTemplate,
      collection: dynamicCollectionName,
      data,
    };
  },
  component: Pages,
  preload: true,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dynamicPage,
  dynamicCollection,
]);

const queryClient = new QueryClient();
/*

This function was used to help generated nested path's in Router. Example: /page/child-page/grand-child-page/
Nested paths was removed from URLs when switching to Page Templates and we never made them back, 
because we were not sure of actually need for nested routes and the added complexity to implement it for Dynamice Pages (page with page template)

type NestedRoute = {
  id: string;
  slug: string;
  parent: { id: string; slug: string };
};

function getChildRoutes(routes: NestedRoute[]) {
  const paths: { path: string; slug: string }[] = [];
  const flapRouteNodeMap = [];

  for (const r of routes) {
    flapRouteNodeMap.push({
      id: r.id,
      slug: r.slug,
      parentId: routes.find((p) => p.id == r.parent?.id)?.id,
    });
  }

  for (const routeNode of flapRouteNodeMap) {
    const path = [];
    let node: typeof routeNode | undefined = routeNode;
    do {
      path.push(node.slug);
      node = flapRouteNodeMap.find((x) => x.id == node?.parentId);
    } while (node);

    paths.push({
      slug: path[0],
      path: path.reverse().join("/"),
    });
  }

  return paths;
}
*/

function RouterBuilder({
  supportedLocales,
  /* nestedPaths, */
  sitemap,
  tenant,
}: {
  sitemap: Sitemap;
  supportedLocales: string[];
  /* nestedPaths: NestedRoute[]; */
  tenant: Tenant;
}) {
  const [basepath, setBasepath] = useState<string>("/");

  useLayoutEffect(() => {
    const localeBase = document.location.pathname.split("/")[1];
    if (supportedLocales.includes(localeBase)) {
      const newBasename = `/${localeBase}`;
      if (newBasename != basepath) {
        console.log("Setting new basepath");
        setBasepath?.(newBasename);
      }
    }
  }, [setBasepath, basepath, supportedLocales]);

  const router = useMemo(() => {
    /*console.log('Creating new Router: ' + basepath)

    // Add nested routes from CMS to router
    const childRoutes = getChildRoutes(nestedPaths);

    for(const route of childRoutes) {
      if(!routeTree.children?.find(x => x.path == route.path)) {
        routeTree.addChildren([...routeTree.children ?? [], 
          createRoute({
            getParentRoute: () => rootRoute,
            path: route.path,
            loader: async ({ context: { locale: ctxLocale } }) => {
              const locale = getLocale(ctxLocale, (location.search as any)?.l);
              const queryOptions = await import("./pages/pages.tsx").then(module => module.pageQueryOptions);
              const data = await queryClient.ensureQueryData(queryOptions(route.slug, locale as any));
              if(!data || !data[0]) {
                throw notFound({
                  routeId: rootRouteId
                });
              }

              return {
                data,
                slug: route.slug
              }
            },
            component: lazy(() => import("./pages/pages")),
            preload: true
          })
        ])
      }
    }*/

    // Update router with selected locale and nested routes
    return createRouter({
      routeTree,
      defaultComponent: RootLayout,
      defaultNotFoundComponent: NotFoundPage,
      defaultErrorComponent: ErrorPage,
      defaultPendingComponent: Loading,
      defaultPreload: "intent",
      defaultPreloadStaleTime: 0,
      context: {
        queryClient,
        locale:
          basepath.length > 1
            ? (basepath.replace("/", "") as LocaleInputType)
            : undefined,
        sitemap,
      },
      basepath,
    });
  }, [basepath, /* nestedPaths,  */  sitemap]);

  return (
    <>
      <AppContext.Provider
        value={{
          tenant,
          sitemap,
        }}
      >
        <RouterProvider router={router} />
      </AppContext.Provider>
    </>
  );
}

function App() {
  const isDraftMode = getIsDraftMode();

  const query = useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      const tenant = getTenant();
      const data = await gqlClient.fetch<InitialQuery, InitialQueryVariables>(
        Initial,
        {
          slug: tenant,
          draftMode: isDraftMode
        }
      );

      return data;
    },
  });

  const supportedLocales = useMemo<string[]>(() => {
    return query.data?.TenantBySlug?.siteLocales ?? [];
  }, [query.data?.TenantBySlug?.siteLocales]);

  /*
  const nestedPaths = useMemo<NestedRoute[]>(() => {
    return []; //query.data?.PagesByTenant?.docs as NestedRoute[] ?? [];
  }, []); //query.data?.PagesByTenant?.docs
  */

  const siteMap = useMemo(() => {
    return query.data?.SitemapByTenant?.docs ?? [];
  }, [query.data?.SitemapByTenant?.docs]);

  const tenant = useMemo(() => {
    return query.data?.TenantBySlug as Tenant;
  }, [query.data?.TenantBySlug]);

  return query.isLoading ? (
    <Loading />
  ) : (
    <RouterBuilder
      supportedLocales={supportedLocales}
      /* nestedPaths={nestedPaths} */
      sitemap={siteMap}
      tenant={tenant}
    />
  );
}

function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <RenderContext.Provider
        value={{
          linkConfig: {
            pathToPageTemplateMap: pathToPageTypeMap,
          },

          // Components
          CMSLink: CMSLink,
          Button: Button,
          RichText: RichText,

          BlocksContainer: ({ children }) => (
            <div className="px-5">{children}</div>
          ),

          // Blocks
          ContentBlock: ContentBlock,
          CodeBlock: CodeBlock,
          MediaBlock: MediaBlock,

          //Hero
          Hero: {
            LowImpactHero: LowImpactHero,
            MediumImpactHero: MediumImpactHero,
            HighImpactHero: HighImpactHero,
          },
        }}
      >
        <App />
      </RenderContext.Provider>
    </QueryClientProvider>
  );
}

export default Main;
