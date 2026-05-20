import axios from "axios"

import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type { UnifiedTaxpayerListItem } from "@/features/taxpayers/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type AllTaxpayersListParams = ApiListParams & {
  status?: string
  taxOfficeId?: string
}

function normalizeAllTaxpayersParams(
  params: AllTaxpayersListParams
): ApiListParams & { status?: string; taxOfficeId?: string } {
  const { status: st, taxOfficeId: to, ...rest } = params

  const status = typeof st === "string" && st.trim() ? st.trim() : undefined
  const taxOfficeId =
    typeof to === "string" && to.trim() ? to.trim() : undefined

  return {
    ...rest,
    ...(status ? { status } : {}),
    ...(taxOfficeId ? { taxOfficeId } : {}),
  }
}

export async function fetchAllTaxpayersList(
  params: AllTaxpayersListParams
): Promise<PaginatedListResponse<UnifiedTaxpayerListItem>> {
  const res = await apiClient.get<
    PaginatedListResponse<UnifiedTaxpayerListItem>
  >(apiPaths.taxpayers.collection, {
    params: normalizeAllTaxpayersParams(params),
  })

  return res.data
}

export type TaxpayerLookupResult = Pick<
  UnifiedTaxpayerListItem,
  "id" | "tin" | "taxpayerType" | "displayName" | "status" | "taxOfficeId"
>

export async function fetchTaxpayerLookupByTin(
  tin: string
): Promise<TaxpayerLookupResult | null> {
  try {
    const res = await apiClient.get<ApiResponse<TaxpayerLookupResult>>(
      apiPaths.taxpayers.lookup,
      { params: { tin } }
    )
    return unwrapApiPayload(res.data)
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null
    }
    throw e
  }
}
