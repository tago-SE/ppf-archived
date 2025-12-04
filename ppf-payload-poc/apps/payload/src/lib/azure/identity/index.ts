import {
  ChainedTokenCredential,
  DefaultAzureCredential,
  ManagedIdentityCredential,
  TokenCredential,
  VisualStudioCodeCredential,
} from "@azure/identity";

const getManagedIdentityCredential = (
  clientId?: string
): ManagedIdentityCredential | null => {
  const managedIdentityClientId =
    clientId || process.env.APP_MANAGED_IDENTITY_CLIENTID;
  return managedIdentityClientId
    ? new ManagedIdentityCredential({ clientId: managedIdentityClientId })
    : null;
};
const getFallbackCredentials = (): TokenCredential[] => {
  return [new VisualStudioCodeCredential(), new DefaultAzureCredential()];
};

const createChainedTokenCredential = (
  clientId?: string
): ChainedTokenCredential => {
  const managedIdentity = getManagedIdentityCredential(clientId);
  const credentials = managedIdentity
    ? [managedIdentity]
    : getFallbackCredentials();
  return new ChainedTokenCredential(...credentials);
};

/**
 * Returns default app AZ credential for local and deployed environment.
 */
export const createAppCredential = createChainedTokenCredential;
