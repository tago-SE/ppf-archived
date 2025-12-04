export type LogInfoType = {
  /**
   * Strategy name
   */
  name: string;
  details: {
    [x: string]: any;
  };
};

type LogIngoArgs = {
  strategyName: string;
  responseHeaders: Headers;
};

export const createAuthLogInfo = ({
  strategyName,
  responseHeaders,
}: LogIngoArgs): LogInfoType => {
  return {
    name: `AuthN (${strategyName})`,
    details: {
      responseHeaders: Object.fromEntries(responseHeaders.entries()),
      strategyName,
    },
  };
};

export const createAuthLogError = ({
  strategyName,
  responseHeaders,
  error,
}: LogIngoArgs & { error: any }): LogInfoType & { error: any } => {
  return {
    name: `AuthN (${strategyName})`,
    error,
    details: {
      responseHeaders: Object.fromEntries(responseHeaders.entries()),
      strategyName,
    },
  };
};
