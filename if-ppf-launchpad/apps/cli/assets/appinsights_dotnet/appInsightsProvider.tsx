"use client";

import { ReactNode, useEffect } from "react";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import {
  ReactPlugin,
  AppInsightsContext,
  useAppInsightsContext,
} from "@microsoft/applicationinsights-react-js";
import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";

const AppInsightsClientConfig = {
  connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING,
  enabled:
    !!import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING &&
    import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING.length > 10,
  /**
   * A boolean that indicated whether to disable the use of cookies by the SDK. If true, the SDK will not store or read any data from cookies. Cookie usage can be re-enabled after initialization via the core.getCookieMgr().enable().
   *
   * TODO: Add implementation or hook to enable the cookies after consent is given.
   */
  disableCookiesUsage: import.meta.env.VITE_APPLICATIONINSIGHTS_DISABLE_COOKIES === "true",
};

/**
 * AppInsightsProvider
 *
 * This component provides Application Insights integration into the application.
 * It wraps the children components and tracks page views, events, and click analytics
 * using Microsoft Application Insights.
 *
 * The provider initializes Application Insights only if a valid connection string
 * is provided via environment variables (`NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`).
 * If the connection string is missing or invalid, the Application Insights functionality
 * is disabled, and the component renders its children without tracking.
 *
 * Dependencies:
 * - @microsoft/applicationinsights-react-js: Provides React-specific telemetry tracking.
 * - @microsoft/applicationinsights-web: Core telemetry functionality.
 * - @microsoft/applicationinsights-clickanalytics-js: Click Analytics plugin to track click events.
 *
 * Props:
 * @param {ReactNode} children - The child components to be wrapped by the provider.
 *
 * Example usage:
 *
 * ```tsx
 * import { AppInsightsProvider } from "./AppInsightsProvider";
 *
 * function MyApp() {
 *   return (
 *     <AppInsightsProvider>
 *       <MyComponent />
 *     </AppInsightsProvider>
 *   );
 * }
 * ```
 *
 * Behavior:
 * - When a valid connection string is provided, the provider:
 *    - Initializes Application Insights with the React plugin and Click Analytics plugin.
 *    - Tracks page views automatically.
 * - If the connection string is missing or invalid:
 *    - Application Insights is not initialized.
 *    - The child components are rendered without tracking.
 *
 */
export function AppInsightsProvider({ children }: { children: ReactNode }) {
  const reactPlugin = new ReactPlugin();
  useEffect(() => {
    if (!AppInsightsClientConfig.enabled) {
      return;
    }
    // *** Add the Click Analytics plug-in. ***
    const clickPluginInstance = new ClickAnalyticsPlugin();
    const clickPluginConfig = {
      autoCapture: true,
    };
    const appInsights = new ApplicationInsights({
      config: {
        disableIkeyDeprecationMessage: true,
        disableInstrumentationKeyValidation: true,
        disableCookiesUsage: AppInsightsClientConfig.disableCookiesUsage,
        connectionString: AppInsightsClientConfig.connectionString,
        extensions: [
          reactPlugin,
          // *** Add the Click Analytics plug-in. ***
          clickPluginInstance,
          //
        ],
        extensionConfig: {
          [reactPlugin.identifier]: {},
          // *** Add the Click Analytics plug-in. ***
          [clickPluginInstance.identifier]: clickPluginConfig,
          //
        },
      },
    });
    appInsights.trackPageView();
    appInsights.loadAppInsights();
    return () => {
      appInsights.unload();
    };
  }, []);

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      {children}
    </AppInsightsContext.Provider>
  );
}

/**
 * Custom hook to access Application Insights instance.
 *
 * This hook must be used within an `AppInsightsProvider` to function properly.
 * If used outside the provider in development, an error will be thrown.
 *
 * Example usage:
 *
 * ```MyButton.tsx
 * "use client";
 *
 * import { useAppInsights } from "../appinsights/appInsightsProvider";
 *
 * export const AppiButton = () => {
 *   const appInsights = useAppInsights();
 *   const handleClick = () => {
 *     appInsights.trackEvent({ name: "MyButtonClicked" });
 *   };
 *   return <button onClick={handleClick}>Click Me</button>;
 * };
 * ```
 */
export function useAppInsights() {
  const reactPlugin = useAppInsightsContext();
  if (!reactPlugin && AppInsightsClientConfig.enabled) {
    throw new Error(
      "useAppInsights must be used within an AppInsightsProvider"
    );
  }
  return reactPlugin;
}
