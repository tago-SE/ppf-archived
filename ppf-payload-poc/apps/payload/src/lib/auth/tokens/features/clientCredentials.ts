export type ClientCredentials = {
  clientId: string;
  clientSecret: string | Promise<string>;
  scope: string;
};
