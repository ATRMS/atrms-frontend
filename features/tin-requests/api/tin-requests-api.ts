import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  TinRequestCreatePayload,
  TinRequestListItem,
} from "@/features/tin-requests/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type TinRequestsListParams = ApiListParams & {
  status?: string
  taxpayerType?: string
}

function normalizeTinRequestsRequestParams(
  params: TinRequestsListParams
): ApiListParams & { status?: string; taxpayerType?: string } {
  const { status: st, taxpayerType: tt, ...rest } = params

  const status =
    typeof st === "string" && st.trim() ? st.trim() : undefined
  const taxpayerType =
    typeof tt === "string" && tt.trim() ? tt.trim() : undefined

  return {
    ...rest,
    ...(status ? { status } : {}),
    ...(taxpayerType ? { taxpayerType } : {}),
  }
}

export async function fetchTinRequestsList(
  params: TinRequestsListParams
): Promise<PaginatedListResponse<TinRequestListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<TinRequestListItem>
  >(apiPaths.taxpayers.tinRequests, {
    params: normalizeTinRequestsRequestParams(params),
  })

  return res.data
}

export async function createTinRequest(
  payload: TinRequestCreatePayload
): Promise<TinRequestListItem> {
  const res = await apiClient.post<ApiResponse<TinRequestListItem>>(
    apiPaths.taxpayers.tinRequests,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function approveTinRequest(
  id: string
): Promise<TinRequestListItem> {
  const res = await apiClient.patch<ApiResponse<TinRequestListItem>>(
    apiPaths.taxpayers.tinRequestApprove(id)
  )

  return unwrapApiPayload(res.data)
}

export async function rejectTinRequest(
  id: string,
  payload: { reason: string }
): Promise<void> {
  await apiClient.patch(apiPaths.taxpayers.tinRequestReject(id), {
    reason: payload.reason.trim(),
  })
}
