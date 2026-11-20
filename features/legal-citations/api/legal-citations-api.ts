import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  Citation,
  CitationPayload,
  CitationVersion,
} from "@/features/legal-citations/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"
export async function fetchCitations(
  params: ApiListParams & { documentType?: string; asOf?: string }
): Promise<PaginatedListResponse<Citation>> {
  return (
    await apiClient.get<PaginatedListResponse<Citation>>(
      apiPaths.masterData.legalCitations,
      { params }
    )
  ).data
}
export async function fetchCitation(code: string): Promise<Citation> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<Citation>>(
        apiPaths.masterData.legalCitationDetail(code)
      )
    ).data
  )
}
export async function fetchCitationVersions(
  code: string
): Promise<CitationVersion[]> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<CitationVersion[]>>(
        apiPaths.masterData.legalCitationVersions(code)
      )
    ).data
  )
}
export async function saveCitation(
  code: string | null,
  version: number | null,
  payload: CitationPayload
): Promise<CitationVersion> {
  const response = !code
    ? await apiClient.post<ApiResponse<CitationVersion>>(
        apiPaths.masterData.legalCitations,
        payload
      )
    : version
      ? await apiClient.put<ApiResponse<CitationVersion>>(
          apiPaths.masterData.legalCitationVersion(code, version),
          payload
        )
      : await apiClient.post<ApiResponse<CitationVersion>>(
          apiPaths.masterData.legalCitationVersions(code),
          payload
        )
  return unwrapApiPayload(response.data)
}
