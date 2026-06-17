import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  IndividualTaxpayerDetail,
  IndividualTaxpayerListItem,
  PatchTaxpayerStatusPayload,
  RegisterIndividualPayload,
  UpdateIndividualTaxpayerPayload,
} from "@/features/individual-taxpayers/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type IndividualTaxpayersListParams = ApiListParams & {
  status?: string
  taxOfficeId?: string
  professionId?: string
}

function normalizeIndividualTaxpayersRequestParams(
  params: IndividualTaxpayersListParams
): ApiListParams & {
  type: string
  status?: string
  taxOfficeId?: string
  professionId?: string
} {
  const { status: st, taxOfficeId: to, professionId: pr, ...rest } = params

  const status = typeof st === "string" && st.trim() ? st.trim() : undefined
  const taxOfficeId =
    typeof to === "string" && to.trim() ? to.trim() : undefined
  const professionId =
    typeof pr === "string" && pr.trim() ? pr.trim() : undefined

  return {
    ...rest,
    type: "INDIVIDUAL",
    ...(status ? { status } : {}),
    ...(taxOfficeId ? { taxOfficeId } : {}),
    ...(professionId ? { professionId } : {}),
  }
}

export async function fetchIndividualTaxpayersList(
  params: IndividualTaxpayersListParams
): Promise<PaginatedListResponse<IndividualTaxpayerListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<IndividualTaxpayerListItem>
  >(apiPaths.taxpayers.collection, {
    params: normalizeIndividualTaxpayersRequestParams(params),
  })

  return res.data
}

export async function registerIndividualTaxpayer(
  payload: RegisterIndividualPayload
): Promise<IndividualTaxpayerDetail> {
  const res = await apiClient.post<ApiResponse<IndividualTaxpayerDetail>>(
    apiPaths.taxpayers.collection,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function fetchIndividualTaxpayerById(
  id: string
): Promise<IndividualTaxpayerDetail> {
  const res = await apiClient.get<ApiResponse<IndividualTaxpayerDetail>>(
    apiPaths.taxpayers.detail(id)
  )

  return unwrapApiPayload(res.data)
}

export async function updateIndividualTaxpayer(
  id: string,
  payload: UpdateIndividualTaxpayerPayload
): Promise<IndividualTaxpayerDetail> {
  const res = await apiClient.patch<ApiResponse<IndividualTaxpayerDetail>>(
    apiPaths.taxpayers.detail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function patchTaxpayerStatus(
  id: string,
  payload: PatchTaxpayerStatusPayload
): Promise<IndividualTaxpayerDetail> {
  const res = await apiClient.patch<ApiResponse<IndividualTaxpayerDetail>>(
    apiPaths.taxpayers.status(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function deleteTaxpayer(id: string): Promise<void> {
  await apiClient.delete(apiPaths.taxpayers.resource(id))
}
