import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  BusinessLineListItem,
  CreateBusinessLinePayload,
  UpdateBusinessLinePayload,
} from "@/features/business-lines/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type BusinessLinesListParams = ApiListParams & {
  /** Filter by active flag (`true` / `false`), when supported by the list endpoint. */
  isActive?: boolean | string
}

function normalizeBusinessLinesRequestParams(
  params: BusinessLinesListParams
): ApiListParams & { isActive?: boolean } {
  const { isActive: raw, ...rest } = params

  let isActive: boolean | undefined
  if (typeof raw === "boolean") {
    isActive = raw
  } else if (raw === "true") {
    isActive = true
  } else if (raw === "false") {
    isActive = false
  }

  return {
    ...rest,
    ...(isActive !== undefined ? { isActive } : {}),
  }
}

export async function fetchBusinessLinesList(
  params: BusinessLinesListParams
): Promise<PaginatedListResponse<BusinessLineListItem>> {
  const res = await apiClient.get<PaginatedListResponse<BusinessLineListItem>>(
    apiPaths.masterData.businessLines,
    {
      params: normalizeBusinessLinesRequestParams(params),
    }
  )

  return res.data
}

/** Wide active-only fetch for reference comboboxes (admin prefetch). */
export async function fetchBusinessLinesReference(): Promise<
  BusinessLineListItem[]
> {
  const res = await fetchBusinessLinesList({
    page: 0,
    size: 500,
    isActive: true,
  })

  return res.data
}

export async function createBusinessLine(
  payload: CreateBusinessLinePayload
): Promise<BusinessLineListItem> {
  const res = await apiClient.post<ApiResponse<BusinessLineListItem>>(
    apiPaths.masterData.businessLines,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateBusinessLine(
  id: string,
  payload: UpdateBusinessLinePayload
): Promise<BusinessLineListItem> {
  const res = await apiClient.put<ApiResponse<BusinessLineListItem>>(
    apiPaths.masterData.businessLineDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateBusinessLine(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.businessLineActivate(id))
}

export async function deactivateBusinessLine(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.businessLineDeactivate(id))
}
