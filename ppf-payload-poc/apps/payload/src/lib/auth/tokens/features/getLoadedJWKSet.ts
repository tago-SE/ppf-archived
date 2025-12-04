import {
  createRemoteJWKSet,
  FlattenedJWSInput,
  JSONWebKeySet,
  JWSHeaderParameters,
} from "jose";
import { getOidcEndpointsForAuthority } from "./oauth_oidc_endpoints";

type JWKsType = {
  (
    protectedHeader?: JWSHeaderParameters,
    token?: FlattenedJWSInput
  ): Promise<CryptoKey>;
  coolingDown: boolean;
  fresh: boolean;
  reloading: boolean;
  reload: () => Promise<void>;
  jwks: () => JSONWebKeySet | undefined;
};
const jwksCache = new Map<string, JWKsType>();

export const getLoadedRemoteJWKSet = async (issuer: string) => {
  let remoteJwks = jwksCache.get(issuer);
  if (!remoteJwks) {
    const endpoints = getOidcEndpointsForAuthority(issuer);
    const jwks_uri = endpoints.jwks_uri;
    remoteJwks = createRemoteJWKSet(new URL(jwks_uri));
  }
  if (!remoteJwks.fresh) {
    await remoteJwks.reload();
  }
  jwksCache.set(issuer, remoteJwks);
  return remoteJwks;
};
