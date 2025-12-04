import {
  ClientSecretCredential,
  ManagedIdentityCredential,
  ChainedTokenCredential,
  VisualStudioCodeCredential,
  DefaultAzureCredential,
  TokenCredential,
} from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { strToBoolean } from "../utils/strToBoolean";

export type MicrosoftGraphClientConfig = {
  /**
   * @fallback process.env.MSGRAPH_TENANT_ID
   */
  tenantId: string;
  /**
   * @fallback process.env.MSGRAPH_CLIENT_ID
   */
  clientId: string;
  /**
   * @fallback process.env.MSGRAPH_CLIENT_SECRET
   */
  clientSecret: string;
  /**
   * @fallback https://graph.microsoft.com/.default
   */
  scopes?: string;
  /**
   * @fallback process.env.MSGRAPH_CLIENT_DEBUG or false
   */
  debugLogging: boolean;
};

const getCredentials = (
  clientId?: string,
  tenantId?: string,
  clientSecret?: string
) => {
  if (process.env.TEST_AZ_DEVELOPER_ACCESS_TOKEN !== undefined) {
    const credential: TokenCredential = {
      getToken: async () => {
        return {
          token: process.env.TEST_AZ_DEVELOPER_ACCESS_TOKEN!,
          expiresOnTimestamp: new Date().setSeconds(new Date().getSeconds() + 60)
        };
      }
    };
    return credential;
  }
  if (!clientId) {
    // When no clientId is passed we try to use the default credentials
    return new ChainedTokenCredential(
      new VisualStudioCodeCredential(),
      new VisualStudioCodeCredential(),
      new DefaultAzureCredential()
    );
  }
  // If there is no tenantId or secret present we assume that we are using the managed Identity of the Application instead
  if (!tenantId || !clientSecret) {
    const managedIdentity = new ManagedIdentityCredential({ clientId });
    return new ChainedTokenCredential(managedIdentity);
  }
  return new ClientSecretCredential(tenantId, clientId, clientSecret);
};

export const createGraphClient = (
  config?: MicrosoftGraphClientConfig
): Client => {
  const options = {
    tenantId: config?.tenantId || process.env.MSGRAPH_TENANT_ID,
    clientId: config?.clientId || process.env.MSGRAPH_CLIENT_ID,
    clientSecret: config?.clientSecret || process.env.MSGRAPH_CLIENT_SECRET,
    scopes: config?.scopes || "https://graph.microsoft.com/.default",
    debugLogging:
      config?.debugLogging || strToBoolean(process.env.MSGRAPH_CLIENT_DEBUG),
  };
  try {
    const credential = getCredentials(
      options.clientId,
      options.tenantId,
      options.clientSecret
    );
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: [options.scopes],
    });
    const client = Client.initWithMiddleware({
      debugLogging: options.debugLogging,
      authProvider,
    });
    return client;
  } catch (e) {
    console.error(
      `Microsoft Graph client setup failure. Ensure client configuration is correct.`,
      e
    );
    throw new Error(
      "Microsoft Graph client setup failure. Ensure client configuration is correct."
    );
  }
};
