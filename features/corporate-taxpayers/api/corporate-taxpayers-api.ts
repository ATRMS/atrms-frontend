import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  CorporateTaxpayerDetail,
  CorporateTaxpayerListItem,
  RegisterCorporatePayload,
  UpdateCorporateTaxpayerPayload,
} from "@/features/corporate-taxpayers/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type CorporateTaxpayersListParams = ApiListParams & {
  status?: string
  taxOfficeId?: string
  companyType?: string
}

function normalizeCorporateTaxpayersRequestParams(
  params: CorporateTaxpayersListParams
): ApiListParams & {
  taxpayerType: string
  status?: string
  taxOfficeId?: string
  companyType?: string
} {
  const {
    status: st,
    taxOfficeId: to,
    companyType: ct,
    ...rest
  } = params

  const status =
    typeof st === "string" && st.trim() ? st.trim() : undefined
  const taxOfficeId =
    typeof to === "string" && to.trim() ? to.trim() : undefined
  const companyType =
    typeof ct === "string" && ct.trim() ? ct.trim() : undefined

  return {
    ...rest,
    taxpayerType: "CORPORATE",
    ...(status ? { status } : {}),
    ...(taxOfficeId ? { taxOfficeId } : {}),
    ...(companyType ? { companyType } : {}),
  }
}

export async function fetchCorporateTaxpayersList(
  params: CorporateTaxpayersListParams
): Promise<PaginatedListResponse<CorporateTaxpayerListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<CorporateTaxpayerListItem>
  >(apiPaths.taxpayers.collection, {
    params: normalizeCorporateTaxpayersRequestParams(params),
  })

  return res.data
}

export async function registerCorporateTaxpayer(
  payload: RegisterCorporatePayload
): Promise<CorporateTaxpayerDetail> {
  const res = await apiClient.post<ApiResponse<CorporateTaxpayerDetail>>(
    apiPaths.taxpayers.collection,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function fetchCorporateTaxpayerById(
  id: string
): Promise<CorporateTaxpayerDetail> {
  const res = await apiClient.get<ApiResponse<CorporateTaxpayerDetail>>(
    apiPaths.taxpayers.corporateDetail(id)
  )

  return unwrapApiPayload(res.data)
}

export async function updateCorporateTaxpayer(
  id: string,
  payload: UpdateCorporateTaxpayerPayload
): Promise<CorporateTaxpayerDetail> {
  const res = await apiClient.patch<ApiResponse<CorporateTaxpayerDetail>>(
    apiPaths.taxpayers.corporateDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}
