import { env } from "@/env.mjs";

const AppInsightsServerConfig = {
  connectionString: env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  enabled: !!env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  internalDebugLogging: env.APPLICATIONINSIGHTS_INTERNAL_DEBUG_LOGGING ?? false,
  internalWarningLogging:
    env.APPLICATIONINSIGHTS_INTERNAL_WARNING_LOGGING ?? false,
  autoCollectConsole: true,
  autoCollectExceptions: true,
  autoCollectDependencies: true,
  autoCollectConsoleLog: true,
  autoDependencyCorrelation: true,
  sendLiveMetrics: true,
  enableWebInstrumentation: true,
  autoCollectRequests: true,
  autoCollectPreAggregatedMetrics: true,
  samplingPercentage: 100,
  autoCollectPerformance: true,
  /**
   * Extended metrics are no longer supported. Please reference the Azure Monitor OpenTelemetry Migration Doc for more information. If this functionality is required, please revert to Application Insights 2.X SDK.
   */
  autoCollectPerformanceExtendedMetrics: undefined,
  /**
   * Heartbeat metrics are no longer supported. Please reference the Azure Monitor OpenTelemetry Migration Doc for more information. If this functionality is required, please revert to Application Insights 2.X SDK. []
   */
  autoCollectHeartbeat: false,
};

export { AppInsightsServerConfig };
