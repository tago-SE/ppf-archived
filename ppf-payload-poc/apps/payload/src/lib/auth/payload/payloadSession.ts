import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "..";

const mockRequestAndResponseFromHeadersForNextAuth = (headers: Headers) => {
  const request = {
    headers,
  } as unknown as NextApiRequest;
  const response = {
    getHeader() {},
    setCookie() {},
    setHeader() {},
    appendHeader() {},
  } as unknown as NextApiResponse;
  return { request, response };
};

/**
 * This will return the session to the header but perferably you should use payload.auth or `payloadAuthenticate`.
 */
export function payloadSession({ headers }: { headers: Headers }) {
  const { request, response } =
    mockRequestAndResponseFromHeadersForNextAuth(headers);
  return auth(request, response);
}
