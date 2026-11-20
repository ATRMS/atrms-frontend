import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  TaxTypeListItem,
  TaxTypeWritePayload,
} from "@/features/tax-types/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type TaxTypesListParams = ApiListParams & {
  category?: string
  isActive?: boolean | string
}

function normalizeTaxTypesRequestParams(
  params: TaxTypesListParams
): ApiListParams & { category?: string; isActive?: boolean } {
  const { isActive: raw, category: catRaw, ...rest } = params

  let isActive: boolean | undefined
  if (typeof raw === "boolean") {
    isActive = raw
  } else if (raw === "true") {
    isActive = true
  } else if (raw === "false") {
    isActive = false
  }

  const category = typeof catRaw === "string" ? catRaw.trim() : undefined

  return {
    ...rest,
    ...(category ? { category } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }
}

export async function fetchTaxTypesList(
  params: TaxTypesListParams
): Promise<PaginatedListResponse<TaxTypeListItem>> {
  const res = await apiClient.get<PaginatedListResponse<TaxTypeListItem>>(
    apiPaths.masterData.taxTypes,
    {
      params: normalizeTaxTypesRequestParams(params),
    }
  )

  return res.data
}

export async function createTaxType(
  payload: TaxTypeWritePayload
): Promise<TaxTypeListItem> {
  const res = await apiClient.post<ApiResponse<TaxTypeListItem>>(
    apiPaths.masterData.taxTypes,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateTaxType(
  id: string,
  payload: TaxTypeWritePayload
): Promise<TaxTypeListItem> {
  const res = await apiClient.put<ApiResponse<TaxTypeListItem>>(
    apiPaths.masterData.taxTypeDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateTaxType(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.taxTypeActivate(id))
}

export async function deactivateTaxType(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.taxTypeDeactivate(id))
}

/** Tax types for grid label resolution (paginated snapshot). */
export async function fetchTaxTypesReference(): Promise<TaxTypeListItem[]> {
  const res = await fetchTaxTypesList({
    page: 0,
    size: 500,
  })

  return res.data
}

/** Active tax types for revenue targets, selects, and filters. */
export async function fetchTaxTypesActiveReference(): Promise<
  TaxTypeListItem[]
> {
  const res = await fetchTaxTypesList({
    page: 0,
    size: 500,
    isActive: true,
  })

  return res.data
}
