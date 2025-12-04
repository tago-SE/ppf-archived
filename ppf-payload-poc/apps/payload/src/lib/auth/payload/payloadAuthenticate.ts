import { getPayloadWithConfig } from "@/lib/utils/getPayload";

/**
 * Utility to execute payload authentication using the implemented strategy, will run the custom strategies.
 */
export async function payloadAuthenticate({ headers }: { headers: Headers }) {
  const payload = await getPayloadWithConfig();
  const authResult = await payload.auth({
    headers,
  });
  return authResult;
}
