# Application Insights for NextJS
``` bash title="CLI"
yarn dlx @ppf/ppf add appinsights
```
## Installation options
### Install for **frontend**
This option will add a sample `<AppInsightsProvider>` code implementation from [@microsoft/applicationinsights-web](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-framework-extensions?tabs=react) to `src/lib/appinsights/index.tsx`.

Update the library code as needed.

The full documentation for the React Plugin of the Application Insights JavaScript SDK can be found on [Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-framework-extensions?tabs=react)

## Finalize installation
1. Add *<AppInsightsProvider/\>* to the root layout JSX code in *src/app/page.tsx* as follows:
``` jsx linenums="1" title="src/app/page.tsx"
<body className={inter.className}>
	{/* ...Other providers */}
	<AppInsightsProvider>
		{children}
	</AppInsightsProvider>
	{/* ...Other providers */}
</body>
```
2. Add values for environment variables for:
``` sh linenums="1" title=".env"
# For the frontend
NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=

# For the backend
APPLICATIONINSIGHTS_CONNECTION_STRING=
```