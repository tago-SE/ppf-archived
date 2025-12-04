import { NextRequest, NextResponse } from "next/server";

import {
  addRequestIdHeader,
  addCorrelationIdHeader,
} from "./lib/utils/api/headers/uuid";

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  const { value: correlationId, name: correlationIdHeader } =
    addCorrelationIdHeader(requestHeaders);
  const { value: requestId, name: requestIdHeader } =
    addRequestIdHeader(requestHeaders);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(correlationIdHeader, correlationId);
  response.headers.set(requestIdHeader, requestId);
  return response;
}

export const config = {
  matcher: [
    /*
    // Not sure if this will work leaving some testing for later
    ${allRoutes
      .filter((route) => !!route?.middleware?.skip)
      .map((route) => `|${route.pathname.slice(1)}`)
      .join("")}
      */
    `/((?!_next/static|_next/image|images|media|favicon.ico|sitemap.xml|robots.txt|api/auth).*)`,
  ],
};
