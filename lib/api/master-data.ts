import { apiClient } from "@/lib/api/client"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export async function fetchMasterDataList<T>(
  path: string,
  params: ApiListParams
): Promise<PaginatedListResponse<T>> {
  const response = await apiClient.get<PaginatedListResponse<T>>(path, {
    params,
  })
  return response.data
}

export async function fetchMasterDataCollection<T>(path: string): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(path)
  return unwrapApiPayload(response.data)
}

export async function saveMasterDataRecord<TRecord, TPayload>(
  collectionPath: string,
  detailPath: string | null,
  payload: TPayload
): Promise<TRecord> {
  const response = detailPath
    ? await apiClient.put<ApiResponse<TRecord>>(detailPath, payload)
    : await apiClient.post<ApiResponse<TRecord>>(collectionPath, payload)
  return unwrapApiPayload(response.data)
}

export async function patchMasterDataRecord<TRecord>(
  path: string,
  body?: unknown
): Promise<TRecord> {
  const response = await apiClient.patch<ApiResponse<TRecord>>(path, body)
  return unwrapApiPayload(response.data)
}
