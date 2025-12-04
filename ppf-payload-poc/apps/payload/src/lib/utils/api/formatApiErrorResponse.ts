import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { GraphError } from "@microsoft/microsoft-graph-client";
import { ApiError as NextApIError } from "next/dist/server/api-utils";

type ErrorTypes = ZodError | GraphError | NextApIError | Error | String;

/**
 *
 * Pass inner error object useful if you wish to throw ApIErrors that are displayed as a inner error.
 */
export class CustomApiError extends NextApIError {
  public readonly inner: ErrorTypes;
  constructor(statusCode: number, message: string, error: ErrorTypes) {
    super(statusCode, message);
    this.inner = error;
  }
}

enum ErrorNames {
  String = "String",
  ZodError = "ZodError",
  GraphError = "GraphError",
  ApiError = "ApiError",
  Error = "Error",
}

interface ApiErrorData {
  details?: {
    stack?: string;
    [x: string]: unknown;
  };
  name: ErrorNames;
}

type ErrorMapperType = (error: ErrorTypes) => ApiErrorData;

const isProd = process.env.NODE_ENV === "production";

const toErrorDetails: Record<ErrorNames, ErrorMapperType> = {
  [ErrorNames.ZodError]: (error) => {
    const { issues, errors: _, stack, cause, formErrors } = error as ZodError;
    const details = isProd
      ? { formErrors, issues }
      : { formErrors, issues, stack, cause };
    return {
      name: ErrorNames.ZodError,
      details: details,
    };
  },
  [ErrorNames.GraphError]: (error) => {
    const { cause, stack, statusCode, code, requestId, body, headers, date } =
      error as GraphError;
    const details = isProd
      ? { requestId, date }
      : { requestId, date, cause, stack, statusCode, code, body, headers };
    return {
      name: ErrorNames.GraphError,
      details: details,
    };
  },
  [ErrorNames.ApiError]: (error) => {
    const { cause, stack } = error as CustomApiError;
    const details = isProd ? undefined : { cause, stack };
    return {
      name: ErrorNames.ApiError,
      details: details,
    };
  },
  [ErrorNames.Error]: (error) => {
    const { cause, stack, message } = error as Error;
    const details = isProd ? undefined : { message, cause, stack };
    return {
      name: ErrorNames.Error,
      details: details,
    };
  },
  [ErrorNames.String]: (error) => {
    const details = isProd ? undefined : { message: error };
    return {
      name: ErrorNames.String,
      details: details,
    };
  },
};

export type ApiErrorResponse = {
  success: boolean;
  message: string;
  status: number;
  data: null;
  error?: ApiErrorData;
};

export class ErrorResponseBuilder implements ApiErrorResponse {
  success: boolean;
  message: string;
  status: number;
  data: null;
  error?: ApiErrorData | undefined;

  private handlers: {
    ZodError: (error: ZodError) => ErrorResponseBuilder;
    GraphError: (error: GraphError) => ErrorResponseBuilder;
    ApiError: (error: NextApIError) => ErrorResponseBuilder;
    Error: (error: Error) => ErrorResponseBuilder;
    String: (error: String) => ErrorResponseBuilder;
  };

  constructor(status = 500, message = "Unhandled error occured") {
    this.data = null;
    this.status = status || 500;
    this.success = false;
    this.message = message;
    this.handlers = {
      ZodError: (error: ZodError) => {
        this.message = error.message;
        this.error = toErrorDetails.ZodError(error);
        return this;
      },
      GraphError: (error: GraphError) => {
        this.message = error.message;
        this.status = error.statusCode;
        this.error = toErrorDetails.GraphError(error);
        return this;
      },
      ApiError: (error: NextApIError) => {
        this.message = error.message;
        this.status = error.statusCode;
        this.error = toErrorDetails.ApiError(error);
        return this;
      },
      Error: (error: Error) => {
        this.message = "An error occurred";
        this.error = toErrorDetails.Error(error);
        return this;
      },
      String: (error) => {
        this.message = "An error occurred";
        this.error = toErrorDetails.String(error);
        return this;
      },
    };
  }

  private isValidErrorStatus(status: number) {
    return !isNaN(status) && status >= 400 && status < 599;
  }

  public setStatus(status: number) {
    if (!this.isValidErrorStatus(status)) {
      console.warn(`Invalid statuus code detected: ${status}`);
      return;
    }
    this.status = status;
    return this;
  }

  public setMessage(message: string) {
    this.message = message;
    return this;
  }

  /**
   * Process the error according to the defined handlers. Note that the handlers will modify the status code.
   */
  public fromError(error: unknown) {
    let errorTypeString = error?.constructor.name;
    if (errorTypeString === CustomApiError.name) {
      // Extract inner error but keep outer message
      const { message, inner } = error as CustomApiError;
      this.fromError(inner).setMessage(message);
    } else {
      // No inner error handle normally
      const _handler = this.handlers[errorTypeString as ErrorNames] as
        | ((error: ErrorTypes) => void)
        | undefined;

      if (_handler) {
        _handler(error as ErrorTypes);
      } else {
        console.warn(`Unhandled error type: ${errorTypeString}`);
        console.info("Error details: ", error);
        this.handlers.Error(error as Error);
      }
    }
    // Try extracting the statusCode from the error (we could also try 'status' here)
    if ((error as CustomApiError | GraphError).hasOwnProperty("statusCode")) {
      this.setStatus((error as CustomApiError | GraphError).statusCode);
    }
    return this;
  }

  toJsonRespponse() {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: this.message,
        status: this.status,
        data: null,
        error: this.error,
      },
      { status: this.status }
    );
  }
}

/**
 * Helper function for error response
 *
 * @param message
 * @param status
 * @returns
 */
export function formatApiErrorResponse(
  message = "An error occurred",
  status = 500,
  error?: ApiErrorData
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message,
      status,
      data: null,
      error: error,
    },
    { status }
  );
}
