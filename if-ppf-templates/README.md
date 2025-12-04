# Introduction

This repository consists of various templates that can be deployed to the PPF infrastructure. The purpose of this repository is to speed up the initial development of new projects.

## Getting Started

### Installing the templates

1. Generate a PAT in Azure DevOps and save the secret.

2. Now run the following command in powershell and replace `<secret>` with your secret from the previous step and `<username>` with your Azure DevOps account username.

```ps1
dotnet nuget add source "https://pkgs.dev.azure.com/if-it/63db51cc-38a6-4c91-8d19-7582890e5f0d/_packaging/ppf-portal-starter/nuget/v3/index.json" --name "ppf-portal-starter" --username "<username>" --password "<secret>" --valid-authentication-types basic
```

You can open your global NuGet.Config to verify that it was setup here: `%APPDATA%\NuGet\NuGet.Config`

Another approach you can try using instead of PAT is [azure-artifacts-credential-provider](https://github.com/microsoft/artifacts-credprovider#azure-artifacts-credential-provider). 

1. Install the tamplates

```bash
dotnet new install PartnerPortalFrameworkTemplates --add-source "https://pkgs.dev.azure.com/if-it/63db51cc-38a6-4c91-8d19-7582890e5f0d/_packaging/ppf-portal-starter/nuget/v3/index.json"
```

### Using templates

1. Navigate to the repository where you want to create a project using the template.
2. Make sure the template you want to use is installed `dotnet new --list`
3. Navigate to the directory where you wish to create the template and then run: `dotnet new <short name> -o "MyProjectName"`

### Uninstalling Template

```bash
dotnet new uninstall PartnerPortalFrameworkTemplates
```

## Contribute

1. If you want to learn more about using and creatitng templates read the following:
   * [guidlines](https://learn.microsoft.com/en-us/dotnet/core/tutorials/cli-templates-create-project-template)
   * [Example Repo](https://github.com/dotnet/templating/tree/main)
