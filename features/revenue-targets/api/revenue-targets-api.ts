import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  RevenueTargetListItem,
  RevenueTargetWritePayload,
} from "@/features/revenue-targets/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type RevenueTargetsListParams = ApiListParams & {
  taxTypeId?: string
  fiscalYear?: number
}

function normalizeRevenueTargetsRequestParams(
  params: RevenueTargetsListParams
): ApiListParams & { taxTypeId?: string; fiscalYear?: number } {
  const { taxTypeId: tid, fiscalYear: fyRaw, ...rest } = params

  const taxTypeId =
    typeof tid === "string" ? tid.trim() : undefined

  let fiscalYear: number | undefined
  if (typeof fyRaw === "number" && Number.isFinite(fyRaw)) {
    fiscalYear = fyRaw
  }

  return {
    ...rest,
    ...(taxTypeId ? { taxTypeId } : {}),
    ...(fiscalYear !== undefined ? { fiscalYear } : {}),
  }
}

export async function fetchRevenueTargetsList(
  params: RevenueTargetsListParams
): Promise<PaginatedListResponse<RevenueTargetListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<RevenueTargetListItem>
  >(apiPaths.masterData.revenueTargets, {
    params: normalizeRevenueTargetsRequestParams(params),
  })

  return res.data
}

export async function createRevenueTarget(
  payload: RevenueTargetWritePayload
): Promise<RevenueTargetListItem> {
  const res = await apiClient.post<ApiResponse<RevenueTargetListItem>>(
    apiPaths.masterData.revenueTargets,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateRevenueTarget(
  id: string,
  payload: RevenueTargetWritePayload
): Promise<RevenueTargetListItem> {
  const res = await apiClient.put<ApiResponse<RevenueTargetListItem>>(
    apiPaths.masterData.revenueTargetDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}
