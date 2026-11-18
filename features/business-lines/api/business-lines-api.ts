import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  BusinessLine,
  BusinessLineWritePayload,
} from "@/features/business-lines/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type BusinessLinesListParams = ApiListParams & {
  active?: boolean
  sectorId?: string
}
export async function fetchBusinessLinesList(
  params: BusinessLinesListParams
): Promise<PaginatedListResponse<BusinessLine>> {
  return (
    await apiClient.get<PaginatedListResponse<BusinessLine>>(
      apiPaths.masterData.businessLines,
      { params }
    )
  ).data
}
export async function fetchBusinessLinesReference(): Promise<BusinessLine[]> {
  return (await fetchBusinessLinesList({ page: 0, size: 100 })).data
}
export async function saveBusinessLine(
  id: string | null,
  payload: BusinessLineWritePayload
): Promise<BusinessLine> {
  const response = id
    ? await apiClient.put<ApiResponse<BusinessLine>>(
        apiPaths.masterData.businessLineDetail(id),
        payload
      )
    : await apiClient.post<ApiResponse<BusinessLine>>(
        apiPaths.masterData.businessLines,
        payload
      )
  return unwrapApiPayload(response.data)
}
export async function setBusinessLineActive(
  id: string,
  active: boolean
): Promise<void> {
  await apiClient.patch(
    active
      ? apiPaths.masterData.businessLineActivate(id)
      : apiPaths.masterData.businessLineDeactivate(id)
  )
}
