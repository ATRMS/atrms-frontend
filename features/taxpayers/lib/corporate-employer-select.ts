import { fetchCorporateTaxpayersList } from "@/features/corporate-taxpayers/api/corporate-taxpayers-api"
import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"

export async function loadCorporateEmployerOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const response = await fetchCorporateTaxpayersList({
    page: 0,
    size: 20,
    search: search.trim() || undefined,
  })

  return response.data.map((taxpayer) => ({
    value: taxpayer.id,
    label: `${taxpayer.displayName} — ${taxpayer.tin}`,
  }))
}
