const pageRouteKeys = [
  "Home",
  "Admin",
  "AdminLogin",
  "AdminLogoutInactivity",
  "AdminError",
  "AuthError",
  "AdminAccount",
] as const;

type PageRouteKeys = (typeof pageRouteKeys)[number];

type RouteMiddlewareConfig = {
  /**
   * If set to true it will be added to paths that the global middleware will not handle
   */
  skip: boolean;
};

export type RouteData = {
  pathname: string;
  isPublic: boolean;
  middleware?: RouteMiddlewareConfig;
};
/*
Alternative pattern where authorization is set as a condition with a callback
[
  {
    route: "/onboarding", 
    condition: (token: JWT, url: string) => {
      if (!token?.user) return null;
  
      return NextResponse.redirect(new URL("/sign-in", url))    
    }
  },
  {
    route: "/profile", 
    condition: (token: JWT, url: string) => {
      if (!token?.user) return null;
  
      return NextResponse.redirect(new URL("/sign-in", url))    
    }
  },
]
*/

export type ApiRouteData = {} & RouteData;

export const pageRoutes: Record<PageRouteKeys, RouteData> = {
  Home: { pathname: "/", isPublic: true },
  Admin: { pathname: "/admin", isPublic: false },
  AdminAccount: { pathname: "/admin/account", isPublic: false },
  AdminLogoutInactivity: {
    pathname: "/admin/logout-inactivity",
    isPublic: false,
  },
  AdminLogin: { pathname: "/admin/login", isPublic: true },
  AdminError: { pathname: "/error", isPublic: true },
  AuthError: { pathname: "/auth/error", isPublic: true },
};

const publicPageRoutes = Object.values(pageRoutes).filter((x) => x.isPublic);

export function isPublicPageRoute(pathname: string) {
  const lowerCasePathName = pathname.toLowerCase();
  return (
    publicPageRoutes.findIndex((x) => (x.pathname = lowerCasePathName)) !== -1
  );
}

// #region API Routes
const apiRoutesKeys = [
  "root",
  "internal",
  "auth",
  "graphql",
  "graphql_playground",
] as const;

type ApiRouteKeys = (typeof apiRoutesKeys)[number];

const skipMiddlewareOptions = {
  skip: true,
};

export const apiRoutes: Record<ApiRouteKeys, RouteData> = {
  root: { pathname: "/api", isPublic: true },
  internal: {
    pathname: "/api/internal",
    isPublic: true,
    middleware: skipMiddlewareOptions,
  },
  auth: {
    pathname: "/api/auth",
    isPublic: true,
    middleware: skipMiddlewareOptions,
  },
  graphql: { pathname: "/api/graphql", isPublic: true },
  graphql_playground: { pathname: "/api/graphql-playground", isPublic: true },
};

const publicApiRoutes = Object.values(apiRoutes).filter((x) => x.isPublic);

export function isPublicApiRoute(pathname: string) {
  const lowerCasePathName = pathname.toLowerCase();
  return (
    publicApiRoutes.findIndex((x) => (x.pathname = lowerCasePathName)) !== -1
  );
}

// Maybe we want to type these out as well (will see...)
// const ignoredApiRoutes = [
//   "/api/auth/callback",
//   "/api/auth/csrf",
//   "/api/auth/signout",
//   "/api/auth/signin",
//   "/api/auth/session",
// ].map((x) => x.toLowerCase());

//#endregion

export const allRoutes = [...publicApiRoutes, ...publicPageRoutes];
