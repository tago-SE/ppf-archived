// TODO: Maybe move to src/gql or is that only auto-generated..?
import request from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { Variables } from "graphql-request";

type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K];
};

// TODO: Broken importgraphql-request/build/legacy/helpers/types"
type VariablesAndRequestHeadersArgs<V extends Variables> = V extends Record<
  string,
  never
> // do we have explicitly no variables allowed?
  ? [variables?: V, requestHeaders?: HeadersInit]
  : keyof RemoveIndex<V> extends never // do we get an empty variables object?
  ? [variables?: V, requestHeaders?: HeadersInit]
  : [variables: V, requestHeaders?: HeadersInit];

function createGqlClient(config: { url: string }) {
  return {
    fetch<T, V extends Variables = Variables>(
      doc: TypedDocumentNode<T, V>,
      ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
    ) {
      return request(config.url, doc, ...variablesAndRequestHeaders);
    },
  };
}

const gqlClient = createGqlClient({
  url: `${import.meta.env.VITE_SERVER_URL}/api/graphql`,
});

export { gqlClient };
