import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  TaxOfficeListItem,
  TaxOfficeWritePayload,
} from "@/features/tax-offices/types"
import type {
  ApiListParams,
  ApiResponse,
  PaginatedListResponse,
} from "@/types/api"

export type TaxOfficesListParams = ApiListParams & {
  regionId?: string
  isActive?: boolean | string
}

function normalizeTaxOfficesRequestParams(
  params: TaxOfficesListParams
): ApiListParams & { regionId?: string; isActive?: boolean } {
  const { isActive: raw, regionId: ridRaw, ...rest } = params

  let isActive: boolean | undefined
  if (typeof raw === "boolean") {
    isActive = raw
  } else if (raw === "true") {
    isActive = true
  } else if (raw === "false") {
    isActive = false
  }

  const regionId = typeof ridRaw === "string" ? ridRaw.trim() : undefined

  return {
    ...rest,
    ...(regionId ? { regionId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }
}

export async function fetchTaxOfficesList(
  params: TaxOfficesListParams
): Promise<PaginatedListResponse<TaxOfficeListItem>> {
  const res = await apiClient.get<PaginatedListResponse<TaxOfficeListItem>>(
    apiPaths.masterData.taxOffices,
    {
      params: normalizeTaxOfficesRequestParams(params),
    }
  )

  return res.data
}

/** Wide fetch for user transfers, filters, and forms. */
export async function fetchTaxOfficesReference(): Promise<TaxOfficeListItem[]> {
  const res = await fetchTaxOfficesList({
    page: 0,
    size: 500,
  })

  return res.data
}

/** Active offices only (assignments and dropdowns). */
export async function fetchTaxOfficesActiveReference(): Promise<
  TaxOfficeListItem[]
> {
  const res = await fetchTaxOfficesList({
    page: 0,
    size: 500,
    isActive: true,
  })

  return res.data
}

export async function createTaxOffice(
  payload: TaxOfficeWritePayload
): Promise<string> {
  const res = await apiClient.post<ApiResponse<string>>(
    apiPaths.masterData.taxOffices,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateTaxOffice(
  id: string,
  payload: TaxOfficeWritePayload
): Promise<TaxOfficeListItem> {
  const res = await apiClient.put<ApiResponse<TaxOfficeListItem>>(
    apiPaths.masterData.taxOfficeDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function activateTaxOffice(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.taxOfficeActivate(id))
}

export async function deactivateTaxOffice(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.taxOfficeDeactivate(id))
}
