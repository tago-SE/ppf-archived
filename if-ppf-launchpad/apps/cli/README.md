# PPF CLI
This CLI allows you to create and manage PPF projects, starting with basic templates and easily adding features or addons as needed. It is designed to help developers quickly set up new projects and seamlessly integrate additional features when required, streamlining the development process.
## Getting started
### Pre-requests
-   Make sure you're using Yarn version 4, as all instructions are tailored for compatibility with the latest version.
-   Update your global `.yarnrc.yml` configuration file by adding the `ppf` scope under `npmScopes`.
```
npmScopes: {
	"ppf": {
		npmRegistryServer: "https://pkgs.dev.azure.com/if-it/63db51cc-38a6-4c91-8d19-7582890e5f0d/_packaging/ppf-portal-starter/npm/registry/",
		npmAuthIdent: "YOUR-PAT-ENCODED",
		npmAlwaysAuth: true
	}
}
```
### Creating new project
To create a new project, run the following command and follow the on-screen instructions, where `<project-type>` can be either `dotnet` or `nextjs`:  
```
yarn dlx @ppf/ppf create <project-type>
```

Command for creating Next.js project:
- `yarn dlx @ppf/ppf create nextjs`

Command for creating .NET project
- `yarn dlx @ppf/ppf create dotnet`

### Installing addon
Navigate to the directory where the `package.json` file is located.  Then, use the following command to install a new addon for the project:  
```
yarn dlx @ppf/ppf add <addon-name>
```