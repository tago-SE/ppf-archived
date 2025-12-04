# Create new project
Use `@ppf/ppf create <template-id>` command to create new project. It will create new project from base template in target directory and install npm packages *(if this option selected during installation)*
> CLI and templates only support latest Yarn package manager
### Create dotnet application
``` bash title="CLI"
yarn dlx @ppf/ppf create dotnet
```
### Create nextjs application
``` bash title="CLI"
 yarn dlx @ppf/ppf create nextjs
```
## Prerequisites
1. Install latest version of yarn globally. Follow instructions on [yarn docs](https://yarnpkg.com/getting-started/install)
2. Setup global config in `%UserProfile%/.yarnrc.yml`
> Example config for yarn 4.1.1

``` yaml linenums="1" title=".yarnrc.yml"
yarnPath: .yarn/releases/yarn-4.1.1.cjs
npmRegistryServer: "https://pkgs.dev.azure.com/if-it/_packaging/common-external-packages/npm/registry"
npmAuthIdent: "Base64 encoded PAT with if-it: in prefix"
npmAlwaysAuth: true
npmScopes: {
  "ppf": {
    npmRegistryServer: "https://pkgs.dev.azure.com/if-it/63db51cc-38a6-4c91-8d19-7582890e5f0d/_packaging/ppf-portal-starter/npm/registry/",
    npmAuthIdent: "Base64 encoded PAT with if-it: in prefix",
    npmAlwaysAuth: true
  }
}
```
3. Use this command in `PowerShell` to encode your PAT:
``` bash
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("if-it:YOUR_PAT_HERE"))
```
4. Update all `npmAuthIdent` fields in `.yarnrc.yaml` with newly encoded PAT