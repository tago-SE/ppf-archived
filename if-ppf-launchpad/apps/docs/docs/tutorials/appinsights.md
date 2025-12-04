# Appinsights

## NextJS Configuration

### Server-Side

First you need to create a [instrumentation] file in under the projects /src folder and opt in to use instrumentation in your next.config.mjs settings. Finally you can manage your Application Insights, import and initialize it inside the `register` function. The template includes an example of how to work with it which you can modify to your needs. Example:

```typescript
'instrumentation.ts'

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { AppInsightsServerConfig: appiConfig } = await import(
      "./config/appinsights"
    );
    if (!appiConfig.connectionString) {
      console.warn("AppInsights.connectionString missing.");
      return;
    } 
    const appInsights = await import("applicationinsights");
    appInsights
      .setup(appiConfig.connectionString)
      .setAutoCollectConsole(
        appiConfig.autoCollectConsole,
        appiConfig.autoCollectConsoleLog
      )
      .setAutoCollectExceptions(appiConfig.autoCollectExceptions)
      .setAutoCollectPerformance(
        appiConfig.autoCollectPerformance,
        appiConfig.autoCollectPerformanceExtendedMetrics
      )
      .setInternalLogging(
        appiConfig.internalDebugLogging,
        appiConfig.internalWarningLogging
      )
      .setAutoCollectPreAggregatedMetrics(
        appiConfig.autoCollectPreAggregatedMetrics
      )
      .setAutoCollectRequests(appiConfig.autoCollectRequests)
      .setAutoCollectHeartbeat(appiConfig.autoCollectHeartbeat)
      .setAutoDependencyCorrelation(appiConfig.autoDependencyCorrelation)
      .setAutoCollectDependencies(appiConfig.autoCollectDependencies)
      .enableWebInstrumentation(appiConfig.enableWebInstrumentation, undefined)
      .setSendLiveMetrics(appiConfig.sendLiveMetrics);

    appInsights.defaultClient.config.samplingPercentage =
      appiConfig.samplingPercentage;

    appInsights.start();
  }
}
```

You can read also read more about the configurations of [node appinsights] and the limitations of using Application Insights 3.X vs 2.X.

#### Server Configuration

| Env Variable                             | Description                                       | Default               |
|------------------------------------------|---------------------------------------------------|-----------------------|
| `APPLICATIONINSIGHTS_CONNECTION_STRING`  | The connection string for Application Insights. `Required`.  | (empty)  |
| `APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING` | Enables internal warning logging in Application Insights SDK. `Optional`.| `false` |
| `APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING` | Enables internal debug logging in Application Insights SDK. `Optional`.| `false` |

## Client-Side

For client-side integration of Application Insights with Next.js, you can follow the example below.

### Client Configuration

| Env Variable                             | Description                                       | Default               |
|------------------------------------------|---------------------------------------------------|-----------------------|
| `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`  | The connection string for Application Insights. `Required`.  | (empty)  |
| `NEXT_PUBLIC_APPLICATIONINSIGHTS_DISABLE_COOKIES`  | Enables cookies to be tracked, we recommend that you leave this disabled until you have proper cookie consent management in place. `Optional`.  | `true`  |

!!! warning "Is the connection string a secret?" [Connection String Docs]

The Application Insights JavaScript SDK requires the connection string to be included during initialization, which makes it visible in plain text within client browsers. Unfortunately, there’s no straightforward way to leverage Microsoft Entra ID-based authentication for browser telemetry.

To mitigate this, we recommend setting up a separate Application Insights resource specifically for browser telemetry if security is a concern.

An alternative approach would be to use the same Application Insights instance for both client and server-side telemetry, or to configure a Reverse Proxy that routes telemetry requests through the server (BFF pattern). This would hide the connection string from the client. [This blog post](https://stenbrinke.nl/blog/hide-app-insights-key-from-the-browser/#:~:text=Like%20we%20discussed) discusses how to set up a reverse proxy in .NET using YARP. However, we believe that such a solution might be overkill for most use cases. Feel free to explore this route if needed and let us know how it went.

### Packages

| Package                      | Description                          | Installation Command                                               | Required/Optional |
|------------------------------|--------------------------------------|-------------------------------------------------------------------|-------------------|
| [@microsoft/applicationinsights-react-js]    | Provides React-specific telemetry tracking | `yarn add @microsoft/applicationinsights-react-js`               | Required          |
| [@microsoft/applicationinsights-web]    | Core telemetry functionality | `yarn add @microsoft/applicationinsights-web`               | Required          |
| [@microsoft/applicationinsights-clickanalytics-js]    | Click Analytics plugin to track click events. | `yarn add @microsoft/applicationinsights-clickanalytics-js`               | Optional          |

### Cookies

Cookie consent is generally necessary when using Application Insights on a web application (?), especially in regions governed by privacy laws like the General Data Protection Regulation (GDPR) in the European Union, or California Consumer Privacy Act (CCPA) in the United States. Ensure that you follow the proper regulations for your use case.


### Example Usage

```tsx title="app.tsx"
  import { AppInsightsProvider } from "./AppInsightsProvider";

  function MyApp() {
    return (
    <AppInsightsProvider>
        <MyComponent />
      </AppInsightsProvider>
    );
  }
```

```tsx title="MyButtonComponent.tsx"
"use client";
 
 import { useAppInsights } from "../appinsights/appInsightsProvider";
 
 export const AppiButton = () => {
   const appInsights = useAppInsights();
   const handleClick = () => {     appInsights.trackEvent({ name: "MyButtonClicked" });
    };
    return <button onClick={handleClick}>Click Me</button>;
 };
```

[instrumentation]: https://nextjs.org/docs/pages/building-your-application/optimizing/instrumentation

[node appinsights]: https://www.npmjs.com/package/applicationinsights

[Connection String Docs]: https://learn.microsoft.com/en-us/azure/azure-monitor/app/sdk-connection-string?tabs=dotnet5#connection-string-with-explicit-endpoint-overrides

[@microsoft/applicationinsights-react-js]: https://www.npmjs.com/package/@microsoft/applicationinsights-react-js

[@microsoft/applicationinsights-web]: https://www.npmjs.com/package/@microsoft/applicationinsights-web

[@microsoft/applicationinsights-clickanalytics-js]: https://www.npmjs.com/package/@microsoft/applicationinsights-clickanalytics-js