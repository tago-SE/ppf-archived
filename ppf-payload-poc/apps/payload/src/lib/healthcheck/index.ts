// TODO: Move to /packages
import {
  ApiHealthCheckComponent,
  ApiHealthCheckResponse,
  ApiStatus,
  HealthcheckFn,
} from "./types";

function getEndDurationStr(start: Date) {
  let durationMs = Date.now() - start.getTime();
  let seconds = Math.floor(durationMs / 1000);
  let milliseconds = durationMs % 1000;
  return (
    new Date(seconds * 1000).toISOString().substring(11, 19) +
    `.${milliseconds.toString().padStart(6, "0")}`
  );
}

const runComponentCheck = async (
  componentName: string,
  degradedThresholdMs: number,
  healthcheckFn: HealthcheckFn
): Promise<ApiHealthCheckComponent> => {
  const start = new Date();
  const status = await healthcheckFn().catch((error) => {
    console.error(error);
    return ApiStatus.Unhealthy;
  });
  let component: ApiHealthCheckComponent = {
    componentName: componentName,
    componentStatus: status,
    componentDuration: getEndDurationStr(start),
  };
  const durationMs = Date.now() - start.getTime();
  if (
    component.componentStatus == ApiStatus.Healthy &&
    durationMs > degradedThresholdMs
  ) {
    component.componentStatus = ApiStatus.Degraded;
  }
  return component;
};

export class ApiHealthCheckHandler {
  private apiName: string;
  private components: Map<
    string,
    { threshold: number; checkFn: HealthcheckFn }
  > = new Map();

  constructor(apiName: string) {
    this.apiName = apiName;
  }

  addComponent(
    name: string,
    degradedThresholdMs: number,
    checkFn: HealthcheckFn
  ) {
    if (this.components.has(name)) {
      throw new Error(`Component '${name}' is already added.`);
    }
    this.components.set(name, { threshold: degradedThresholdMs, checkFn });
  }

  async execute(): Promise<ApiHealthCheckResponse> {
    const start = new Date();
    const componentsResults = await Promise.all(
      Array.from(this.components.entries()).map(
        ([name, { threshold, checkFn }]) =>
          runComponentCheck(name, threshold, checkFn)
      )
    );

    const totalDuration = getEndDurationStr(start);

    const overallStatus = componentsResults.some(
      (c) => c.componentStatus === ApiStatus.Unhealthy
    )
      ? ApiStatus.Unhealthy
      : componentsResults.some((c) => c.componentStatus === ApiStatus.Degraded)
      ? ApiStatus.Degraded
      : ApiStatus.Healthy;

    return {
      apiName: this.apiName,
      apiStatus: overallStatus,
      apiTotalDuration: totalDuration,
      components: componentsResults,
    };
  }
}
