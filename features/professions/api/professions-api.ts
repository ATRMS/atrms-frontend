import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  ProfessionListItem,
  ProfessionWritePayload,
} from "@/features/professions/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type ProfessionsListParams = ApiListParams & {
  isActive?: boolean | string
}

function normalizeProfessionsRequestParams(
  params: ProfessionsListParams
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

export async function fetchProfessionsList(
  params: ProfessionsListParams
): Promise<PaginatedListResponse<ProfessionListItem>> {
  const res = await apiClient.get<PaginatedListResponse<ProfessionListItem>>(
    apiPaths.masterData.professions,
    {
      params: normalizeProfessionsRequestParams(params),
    }
  )

  return res.data
}

export async function createProfession(
  payload: ProfessionWritePayload
): Promise<ProfessionListItem> {
  const res = await apiClient.post<ApiResponse<ProfessionListItem>>(
    apiPaths.masterData.professions,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateProfession(
  id: string,
  payload: ProfessionWritePayload
): Promise<ProfessionListItem> {
  const res = await apiClient.put<ApiResponse<ProfessionListItem>>(
    apiPaths.masterData.professionDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateProfession(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.professionActivate(id))
}

export async function deactivateProfession(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.professionDeactivate(id))
}
