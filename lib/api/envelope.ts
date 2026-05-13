import type { ApiResponse } from "@/types/api"

export function unwrapApiPayload<T>(payload: ApiResponse<T> | T): T {
  return typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "status" in payload
    ? (payload as ApiResponse<T>).data
    : (payload as T)
}
