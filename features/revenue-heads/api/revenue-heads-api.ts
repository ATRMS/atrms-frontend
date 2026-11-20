import axios from "axios"
import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  RateVersion,
  RevenueHead,
  RevenueHeadWritePayload,
} from "@/features/revenue-heads/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"
export type RevenueHeadsParams = ApiListParams & {
  taxTypeId?: string
  stateAgencyId?: string
  active?: boolean
}
export async function fetchRevenueHeads(
  params: RevenueHeadsParams
): Promise<PaginatedListResponse<RevenueHead>> {
  return (
    await apiClient.get<PaginatedListResponse<RevenueHead>>(
      apiPaths.masterData.revenueHeads,
      { params }
    )
  ).data
}
export async function saveRevenueHead(
  id: string | null,
  payload: RevenueHeadWritePayload
): Promise<RevenueHead> {
  const response = id
    ? await apiClient.put<ApiResponse<RevenueHead>>(
        apiPaths.masterData.revenueHeadDetail(id),
        payload
      )
    : await apiClient.post<ApiResponse<RevenueHead>>(
        apiPaths.masterData.revenueHeads,
        payload
      )
  return unwrapApiPayload(response.data)
}
export async function fetchRates(id: string): Promise<RateVersion[]> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<RateVersion[]>>(
        apiPaths.masterData.revenueHeadRates(id)
      )
    ).data
  )
}
export async function fetchInForceRate(
  id: string
): Promise<RateVersion | null> {
  try {
    return unwrapApiPayload(
      (
        await apiClient.get<ApiResponse<RateVersion>>(
          apiPaths.masterData.revenueHeadRate(id)
        )
      ).data
    )
  } catch (caught) {
    if (axios.isAxiosError(caught) && caught.response?.status === 404)
      return null
    throw caught
  }
}
export async function saveRate(
  id: string,
  version: number | null,
  payload: unknown
): Promise<RateVersion> {
  const response = version
    ? await apiClient.put<ApiResponse<RateVersion>>(
        apiPaths.masterData.revenueHeadRateVersion(id, version),
        payload
      )
    : await apiClient.post<ApiResponse<RateVersion>>(
        apiPaths.masterData.revenueHeadRates(id),
        payload
      )
  return unwrapApiPayload(response.data)
}
