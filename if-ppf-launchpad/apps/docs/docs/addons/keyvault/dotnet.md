# KeyVault for Dotnet
``` bash title="CLI"
yarn dlx @ppf/ppf add keyvault
```
## What it will do

1. Installs `Azure.Extensions.AspNetCore.Configuration.Secrets` package
2. Create `KeyVault` **backend** library in `Lib/KeyVault` directory
3. Adds `builder.ConfigureKeyVault();` to *Program.cs*
4. Creates configuration structure in appsettings.json 

## Finalize installation
Set variables in `appsettings.json`
``` json linenums="1" title="appsettings.json"
"KeyVault": {
	"Url": "",
	"ClientId": "",
	"ObjectId": ""
}
```