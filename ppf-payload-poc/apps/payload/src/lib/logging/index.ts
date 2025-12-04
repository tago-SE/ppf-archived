enum LogLevel {
  /**
   * Debug level (appInsights.Contracts.SeverityLevel.Verbose).
   * Use for detailed troubleshooting information typically only needed for debugging.
   * These logs are usually only captured in development environments.
   */
  Debug = 0,

  /**
   * Information level (Equivalent to AppInsights SeverityLevel.Information).
   * Use for tracking general flow of the application. These logs typically have long-term value.
   */
  Information = 1,

  /**
   * Warning level (appInsights.Contracts.SeverityLevel.Warning).
   * Use for abnormal or unexpected events in the application flow.
   * These may include errors or other conditions that do not cause the application to stop, but which may need to be investigated.
   */
  Warning = 2,

  /**
   * Error level (appInsights.Contracts.SeverityLevel.Error).
   * Use for errors and exceptions that cannot be handled or which result in a failure in the current operation or request.
   */
  Error = 3,
}

const isBrowser = typeof window !== "undefined";

const browserConsoleLogLevel: LogLevel = 1;

if (isBrowser) {
  let silencedLevels = [];

  if (browserConsoleLogLevel > 0) {
    silencedLevels.push(console.debug);
  }

  if (browserConsoleLogLevel > 1) {
    silencedLevels.push(console.info);
    silencedLevels.push(console.log);
  }

  if (browserConsoleLogLevel > 2) {
    silencedLevels.push(console.warn);
  }

  if (browserConsoleLogLevel > 3) {
    silencedLevels.push({ name: "error" });
  }

  const silencedFunctionNames = silencedLevels
    .map((func) => func.name)
    .join(", ");
  console.debug(
    `Browser Log Level set to ${browserConsoleLogLevel}. Silenced functions: ${silencedFunctionNames}`
  );

  silencedLevels.forEach((f) => {
    console[f.name as "info" | "error" | "warn" | "debug" | "log"] = () => {};
  });
}

interface LoggerConfig {
  /**
   * Tag or tags to label the message. Can be a single string or an array of strings.
   *
   * @example 'MicrosoftGraphClient'
   * @example ['Auth', 'SignIn']
   */
  tags: string | string[];

  /**
   * Filter for log level such that any levels used below this will not be used.
   */
  logLevel?: LogLevel;
  /**
   * Default `True´
   */
  enabled?: boolean;
}

class Logger {
  private tags: string[] = [];

  public enabled: boolean = true;

  /**
   * Construct a new logger.
   *
   * NOTE: Do not use this in middleware. This can cause issues due to Edge runtime, ie. "Cannot read property of null: Reading (config)".
   *
   * @param config
   */
  constructor(config: LoggerConfig) {
    this.enabled = typeof config.enabled == "boolean" ? config.enabled : true;
    if (config?.tags) {
      this.tags = Array.isArray(config.tags) ? config.tags : [config.tags];
    } else {
      this.tags = [];
    }
  }

  public debug(message: string, ...args: unknown[]) {
    this._logMessage(message, LogLevel.Debug, args);
  }

  public info(message: string, ...args: unknown[]) {
    this._logMessage(message, LogLevel.Information, args);
  }

  public warn(message: string, ...args: unknown[]) {
    this._logMessage(message, LogLevel.Warning, args);
  }

  public error(message: string, error?: unknown, ...args: unknown[]) {
    this._logMessage(message, LogLevel.Error, args, error as Error);
  }

  private _logMessage(
    message: string,
    severity: LogLevel,
    args: unknown[],
    error?: Error
  ) {
    if (!this.enabled) return;
    const allTags = [...this.tags].map((tag) => `[${tag}]`).join("");
    const formattedMessage = `${allTags}[${logLevelToString[severity]}] - ${message}`;

    this._consoleLog(formattedMessage, severity, args, error);
  }

  private _consoleLog(
    message: string,
    severity: LogLevel,
    args: unknown[],
    error?: Error
  ) {
    const consoleLogger = logLevelToConsoleFunction[severity] ?? console.log;
    if (error) {
      consoleLogger(message, error, ...args);
      const customProperties = { message, ...args };
    } else {
      consoleLogger(message, ...args);
    }
  }
}

const logLevelToConsoleFunction = {
  [LogLevel.Debug]: console.debug,
  [LogLevel.Information]: console.info,
  [LogLevel.Warning]: console.warn,
  [LogLevel.Error]: console.error,
};

const logLevelToString = {
  [LogLevel.Debug]: "debug",
  [LogLevel.Information]: "info",
  [LogLevel.Warning]: "warn",
  [LogLevel.Error]: "error",
};

const defaultLogger = new Logger({ tags: [] });

export { defaultLogger };

export default Logger;
