# Key Vault Usage

In this guide, we'll walk you through setting up and using the Azure Key Vault client in a Next.js application. You'll learn how to install the necessary packages, configure credentials, and understand the differences between local and deployed environments.

Reference: https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node

## Packages

First install `@azure/identity` along with one of the client libraries. Remember to only install the libraries which you need.

| Package                      | Description                          | Installation Command                                               | Required/Optional |
|------------------------------|--------------------------------------|-------------------------------------------------------------------|-------------------|
| `@azure/identity`            | Client library for Identity | `yarn add @azure/identity`               | Required          |
| `@azure/keyvault-secrets`    | Client library for Key Vault secrets | `yarn add @azure/keyvault-secrets`               | Optional          |
| `@azure/keyvault-certificates` | Client library for Key Vault certificates | `yarn add @azure/keyvault-certificates`           | Optional          |
| `@azure/keyvault-keys`        | Client library for Key Vault keys     | `yarn add @azure/keyvault-keys`                  | Optional          |

## Code Integration

To securely access Azure Key Vault, you'll need to authenticate using appropriate credentials. Below is the provider code for the correct credentials based on your environment and libraries you imported.

### Environment Variables

To use Azure Key Vault with the provided code, you need to configure the following environment variables:

- **`KEY_VAULT_URL`**: (Required) The URL of your Azure Key Vault instance. This is used by the `SecretClient` to interact with the Key Vault service. It should be in the format `https://<your-key-vault-name>.vault.azure.net`.
- **`KEY_VAULT_CLIENTID`**: (Optional) The client ID for a user-assigned managed identity. If this is provided, the code will use the `ManagedIdentityCredential` to authenticate. This is typically used in deployed environments where a managed identity is available using the container apps identity.


### Example Configuration

In your `.env` file or environment configuration, you should include and adjust env.mjs accordingly:

```env
KEY_VAULT_CLIENTID=<your-client-id>
KEY_VAULT_URL=https://<your-key-vault-name>.vault.azure.net
```

```typescript title="apps\nextjs\src\lib\keyvault\index.ts"

import {
  ChainedTokenCredential,
  DefaultAzureCredential,x
  ManagedIdentityCredential,
  VisualStudioCodeCredential,
} from "@azure/identity";
import { env } from "@/env.mjs";
// import { SecretClient } from "@azure/keyvault-secrets";
// import { KeyClient } from "@azure/keyvault-keys"
// import { CertificateClient } from "@azure/keyvault-certificates";

/**
 * Function to get the appropriate credentials based on the environment. 
 * When KEY_VAULT_CLIENTID is set, it will use ManagedIdentityCredential,
 * otherwise, it will fall back to ChainedTokenCredential suitable for local development.
 */
function getCredential(): ChainedTokenCredential | ManagedIdentityCredential {
  if (env.KEY_VAULT_CLIENTID) {
    return new ManagedIdentityCredential({ clientId: env.KEY_VAULT_CLIENTID });
  } else {
    return new ChainedTokenCredential(
      new VisualStudioCodeCredential(),
      new DefaultAzureCredential()
    );
  }
}


const credential = getCredential();

// const secretClient = new SecretClient(env.KEY_VAULT_URL, credential);
// export { secretClient };

// const certificateClient = new CertificateClient(env.KEY_VAULT_UR, credential);
// export { certificateClient }

// const keyClient = new KeyClient(env.KEY_VAULT_UR, credentials);
// export { keyClient }

```

### Example Usage

```typescript
import { secretClient } from "@/lib/keyvault";
const secret = await secretClient.getSecret(secretName);
```
