# KeyVault for Nextjs
``` bash title="CLI"
yarn dlx @ppf/ppf add keyvault
```
## What it will do

1. Generates KeyVault library in `src/lib/keyvault` base on selected options during installation.
2. Installs `@azure/identity` package
3. Installs `@azure/keyvault-secrets`, `@azure/keyvault-certificates`, `@azure/keyvault-keys` depending on selected options during installation

## Finalize installation
Set variables in `.env` file
``` sh linenums="1" title=".env"
KEY_VAULT_CLIENTID=<your-client-id>
KEY_VAULT_URL=https://<your-key-vault-name>.vault.azure.net
```
Example usage
``` js linenums="1" title="example.tsx"
import { secretClient } from "@/lib/keyvault";
const secret = await secretClient.getSecret(secretName);
```
