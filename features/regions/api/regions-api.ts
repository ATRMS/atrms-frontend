import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type { Region, RegionWritePayload } from "@/features/regions/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type RegionsListParams = ApiListParams & { active?: boolean }

export async function fetchRegionsList(
  params: RegionsListParams
): Promise<PaginatedListResponse<Region>> {
  const response = await apiClient.get<PaginatedListResponse<Region>>(
    apiPaths.masterData.regions,
    { params }
  )
  return response.data
}

export async function fetchRegionsReference(): Promise<Region[]> {
  return (await fetchRegionsList({ page: 0, size: 100 })).data
}

export async function saveRegion(
  id: string | null,
  payload: RegionWritePayload
): Promise<Region> {
  const response = id
    ? await apiClient.put<ApiResponse<Region>>(
        apiPaths.masterData.regionDetail(id),
        payload
      )
    : await apiClient.post<ApiResponse<Region>>(
        apiPaths.masterData.regions,
        payload
      )
  return unwrapApiPayload(response.data)
}

export async function setRegionActive(
  region: Region,
  active: boolean
): Promise<Region> {
  const response = await apiClient.patch<ApiResponse<Region>>(
    active
      ? apiPaths.masterData.regionActivate(region.id)
      : apiPaths.masterData.regionDeactivate(region.id)
  )
  return unwrapApiPayload(response.data)
}
