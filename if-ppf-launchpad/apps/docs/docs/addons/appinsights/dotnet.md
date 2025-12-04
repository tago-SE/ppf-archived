# Application Insights for Dotnet
``` bash title="CLI"
yarn dlx @ppf/ppf add appinsights
```
## Installation options
Install application insights both for frontend and backend projects.
### Frontend
For the **frontend** project it will install the following packages:
``` linenums="1"
@microsoft/applicationinsights-react-js
@microsoft/applicationinsights-clickanalytics-js
```
and add library file at `src/lib/appinsights/appInsightsProvider.tsx`
Full documentation for the React Plugin for the Application Insights JavaScript SDK can be found on [Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-framework-extensions?tabs=react)
### Backend
For the **backend** project it will install `Microsoft.ApplicationInsights.AspNetCore` package. Full documentation can be found at [Application Insights for ASP.NET Core applications Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/app/asp-net-core)
## Finalize installation
### Frontend
1. Add *<AppInsightsProvider/\>* in *src/main.tsx* as follows:
``` jsx linenums="1" title="src/main.tsx"
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* potentially other providers... */}
		<AppInsightsProvider>
			{/* potentially other providers... */}
			<App/>
		</AppInsightsProvider>
	</StrictMode>,
)
```
2. Set the values for environment variables in `.env.local`:
``` sh linenums="1" title=".env.local"
VITE_APPLICATIONINSIGHTS_CONNECTION_STRING=public connection string
VITE_APPLICATIONINSIGHTS_DISABLE_COOKIES=true|false
```
### Backend
1. Add `builder.Services.AddApplicationInsightsTelemetry();` after the `WebApplication.CreateBuilder()` method, as in this example:
``` cs linenums="1" title="Program.cs"
// This method gets called by the runtime. Use this method to add services to the container.  
var builder = WebApplication.CreateBuilder(args); 

// The following line enables Application Insights telemetry collection. 
builder.Services.AddApplicationInsightsTelemetry();
```
2. Set the connection string in configuration
``` json linenums="1" title="appsettings.json"
"ApplicationInsights": { 
	"ConnectionString": "Copy connection string from Application Insights Resource Overview" 
}
```