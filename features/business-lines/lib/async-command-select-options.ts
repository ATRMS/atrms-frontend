import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"
import type { LookupEntry } from "@/lib/query/lookups"
import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type { ApiResponse } from "@/types/api"

export async function loadActiveBusinessLinesAsyncOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const response = await apiClient.get<
    ApiResponse<{ businessLines: LookupEntry[] }>
  >(apiPaths.masterData.lookups, { params: { types: "businessLines" } })
  const term = search.trim().toLowerCase()
  return unwrapApiPayload(response.data)
    .businessLines.filter(
      (line) =>
        !term ||
        line.name.toLowerCase().includes(term) ||
        line.code.toLowerCase().includes(term)
    )
    .slice(0, 20)
    .map((line) => ({ value: line.id, label: `${line.code} — ${line.name}` }))
}
