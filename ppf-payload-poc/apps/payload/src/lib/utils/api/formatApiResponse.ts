import { NextResponse } from "next/server";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  data?: T;
};

/**
 * Helper function for success response
 *
 * @param data
 * @param message
 * @param status
 * @returns
 */
export function formatApiResponse<T>(
  data: T,
  message = "Operation completed successfully",
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      status,
      data: data,
    },
    { status }
  );
}
/**
 * Maps FetchResponse to ApiResponse<T>
 */
export async function toApiResponseResult<T>(response: Response) {
  return (await response.json()) as ApiResponse<T | null>;
}
