import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type { TaxOfficeOption } from "@/features/users/types"
import type { ApiResponse } from "@/types/api"

export async function fetchTaxOfficesForFilter(): Promise<TaxOfficeOption[]> {
  const res = await apiClient.get<ApiResponse<TaxOfficeOption[]>>(
    apiPaths.masterData.taxOffices
  )

  return unwrapApiPayload(res.data)
}
