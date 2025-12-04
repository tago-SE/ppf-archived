import { fileURLToPath } from "url";
import path from "path";
import { buildConfig } from "payload";
import { Sessions, Users } from "./collections/Users";
import { Tenants } from "./collections/Tenants";
import { defaultLocale, locales } from "./locales";
import {
  COLLECTION_SLUG_DYANMIC_PAGE,
  COLLECTION_SLUG_TENANTS,
  COLLECTION_SLUG_USERS,
} from "./collections/config";
import { Media } from "./collections/Media";
import { defaultLexical } from "@/fields/defaultLexical";
import { Categories } from "./collections/Categories";
import { DyanmicPages } from "./collections/Pages";
import { ADMIN_PAGE_ROUTE } from "./lib/auth/config";
import { pageRoutes } from "./routes";
import { customResolvers } from "./graphql/queries";
import { plugins } from "./plugins";
import { postgresDbAdapter } from "./lib/db";
import { jobs } from "./jobs";
import ReusableBlocks from "./collections/ReusableBlocks";
import ReferenceTrack from "./collections/ReferenceTrack";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const publicSite = process.env.PAYLOAD_PUBLIC_SITE_URL as string;

const whitelistedSites = [
  process.env.PAYLOAD_PUBLIC_SERVER_URL || "",
  ...(publicSite
    ? publicSite.includes(",")
      ? publicSite.split(",")
      : [publicSite]
    : [""]),
  process.env.DOTNET_PUBLIC_URL || "",
].filter(Boolean);

const pathToPageTypeMap: Record<string, string> = {
  landingPage: 'landing',
  productPage: 'product',
  documentationPage: 'documentation',
  articlePage: 'article',
  standardPage: 'page'
}

export default buildConfig({
  routes: {
    admin: ADMIN_PAGE_ROUTE,
  },
  i18n: {
    // Surpreses Tenant key not found warning
    translations: {
      en: {
        "Tenant": "Tenant"
      }
    }
  },
  admin: {
    routes: {
      createFirstUser: '/',
      forgot: '/',
      reset: '/',
      login: `/${pageRoutes.AdminLogin.pathname.replace(
        pageRoutes.Admin.pathname,
        ""
      ).substring(1)}`,
      account: `/${pageRoutes.AdminAccount.pathname.replace(
        pageRoutes.Admin.pathname,
        ""
      ).substring(1)}`,
    },
    components: {
      // admin/login
      afterLogin: ["@/components/AfterLogin#OAuthLoginButton"],
      logout: { Button: "@/components/LogoutButton" },
      // afterNavLinks: [
      //   //"@/components/TenantSelector#TenantSelectorRSC",
      //   "@/components/AfterLogin#OAuthLoginButton",
      // ],
      graphics: {
        Logo: "@/components/Logo#Logo",
        Icon: "@/components/Logo#Logo",
      },
      providers: [
        "@/components/providers/appinsights#default",
        "@/components/providers/auth#default",
      ],
    },
    user: COLLECTION_SLUG_USERS,
    livePreview: {
      url: async ({ data, locale, collectionConfig, req }) => {
        const tenant = await req.payload.findByID({
          collection: COLLECTION_SLUG_TENANTS,
          id: data.tenant,
        });

        if (!tenant.siteUrl) {
          return "/404";
        }

        const isPage = collectionConfig?.slug === COLLECTION_SLUG_DYANMIC_PAGE;
        const urlPath = isPage
          ? `${locale.code}/${pathToPageTypeMap[data.pageTemplate]}/${data.id}/`
          : `${locale.code}/${collectionConfig?.slug}/${data.id}/`;

        const previewUrl = new URL(urlPath, tenant.siteUrl);
        previewUrl.searchParams.append("preview", data.id);
        previewUrl.searchParams.append("tenant", tenant.slug);

        return previewUrl.toString();
      },
      collections: [COLLECTION_SLUG_DYANMIC_PAGE],
    },
  },
  collections: [Tenants, Users, Sessions, Media, Categories, DyanmicPages, ReusableBlocks, ReferenceTrack],
  // NOTE: removing this to see if live preview works without these settings
  cors: whitelistedSites,
  csrf: whitelistedSites,
  editor: defaultLexical,
  plugins: [...plugins],
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  db: postgresDbAdapter,
  graphQL: {
    schemaOutputFile: path.resolve(dirname, "generated-schema.graphql"),
    disablePlaygroundInProduction: false, // TODO: This should be changed in future
    queries: customResolvers,
  },
  //editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  localization: {
    locales: locales,
    defaultLocale: defaultLocale, // required
    fallback: true,
  },
  jobs: {
    ...jobs
  }
});
