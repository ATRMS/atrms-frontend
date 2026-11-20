import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  Parameter,
  ParameterValue,
  ParameterVersion,
} from "@/features/parameters/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"
export async function fetchParameters(
  params: ApiListParams & { asOf?: string }
): Promise<PaginatedListResponse<Parameter>> {
  return (
    await apiClient.get<PaginatedListResponse<Parameter>>(
      apiPaths.masterData.parameters,
      { params }
    )
  ).data
}
export async function fetchParameter(code: string): Promise<Parameter> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<Parameter>>(
        apiPaths.masterData.parameterDetail(code)
      )
    ).data
  )
}
export async function fetchParameterVersions(
  code: string
): Promise<ParameterVersion[]> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<ParameterVersion[]>>(
        apiPaths.masterData.parameterVersions(code)
      )
    ).data
  )
}
export async function saveParameterVersion(
  code: string,
  version: number | null,
  payload: {
    value: ParameterValue
    effectiveFrom: string
    sourceReference?: string
  }
): Promise<ParameterVersion> {
  const response = version
    ? await apiClient.put<ApiResponse<ParameterVersion>>(
        apiPaths.masterData.parameterVersion(code, version),
        payload
      )
    : await apiClient.post<ApiResponse<ParameterVersion>>(
        apiPaths.masterData.parameterVersions(code),
        payload
      )
  return unwrapApiPayload(response.data)
}
