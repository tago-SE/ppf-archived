export enum ApiStatus {
  Healthy = "Healthy",
  Degraded = "Degraded",
  Unhealthy = "Unhealthy",
}

export interface ApiHealthCheckComponent {
  componentName: string;
  componentStatus: ApiStatus;
  componentDuration: string;
}

export interface ApiHealthCheckResponse {
  apiName: string;
  apiStatus: ApiStatus;
  apiTotalDuration: string;
  components: ApiHealthCheckComponent[];
}

export type HealthcheckFn = () => Promise<ApiStatus>;
