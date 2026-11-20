import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  CurrencyListItem,
  CurrencyWritePayload,
} from "@/features/currencies/types"
import type { ApiResponse } from "@/types/api"

export async function fetchCurrenciesList(): Promise<
  ApiResponse<CurrencyListItem[]>
> {
  const res = await apiClient.get<ApiResponse<CurrencyListItem[]>>(
    apiPaths.masterData.currencies
  )

  return res.data
}

export async function fetchCurrenciesReference(): Promise<CurrencyListItem[]> {
  const res = await fetchCurrenciesList()
  return res.data
}

export async function createCurrency(
  payload: CurrencyWritePayload
): Promise<CurrencyListItem> {
  const res = await apiClient.post<ApiResponse<CurrencyListItem>>(
    apiPaths.masterData.currencies,
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function updateCurrency(
  id: string,
  payload: CurrencyWritePayload
): Promise<CurrencyListItem> {
  const res = await apiClient.put<ApiResponse<CurrencyListItem>>(
    apiPaths.masterData.currencyDetail(id),
    payload
  )

  return unwrapApiPayload(res.data)
}

export async function setDefaultCurrency(id: string): Promise<void> {
  await apiClient.patch(apiPaths.masterData.currencySetDefault(id))
}
