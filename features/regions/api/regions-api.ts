import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  RegionListItem,
  RegionWritePayload,
} from "@/features/regions/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type RegionsListParams = ApiListParams & {
  /** Filter by geographic level when supported by the list endpoint. */
  type?: string
}

function normalizeRegionsRequestParams(
  params: RegionsListParams
): ApiListParams & { type?: string } {
  const { type: typeRaw, ...rest } = params
  const type =
    typeof typeRaw === "string" ? typeRaw.trim().toUpperCase() : undefined

  return {
    ...rest,
    ...(type ? { type } : {}),
  }
}

export async function fetchRegionsList(
  params: RegionsListParams
): Promise<PaginatedListResponse<RegionListItem>> {
  const res = await apiClient.get<PaginatedListResponse<RegionListItem>>(
    apiPaths.masterData.regions,
    {
      params: normalizeRegionsRequestParams(params),
    }
  )

  return res.data
}

/** Wide fetch for parent dropdowns and label lookups. */
export async function fetchRegionsReference(): Promise<RegionListItem[]> {
  const res = await fetchRegionsList({
    page: 0,
    size: 500,
  })

  return res.data
}

export async function createRegion(
  payload: RegionWritePayload
): Promise<RegionListItem> {
  const res = await apiClient.post<ApiResponse<RegionListItem>>(
    apiPaths.masterData.regions,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateRegion(
  id: string,
  payload: RegionWritePayload
): Promise<RegionListItem> {
  const res = await apiClient.put<ApiResponse<RegionListItem>>(
    apiPaths.masterData.regionDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}
