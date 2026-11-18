import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { queryKeys } from "@/lib/query-keys"
import type { ApiResponse } from "@/types/api"

export const ADMIN_REFERENCE_SELECT_STALE_MS = 5 * 60 * 1000

export type LookupType =
  | "regions"
  | "taxOffices"
  | "stateAgencies"
  | "lgas"
  | "sectors"
  | "businessLines"
  | "professions"
  | "taxTypes"
  | "currencies"
  | "revenueHeads"

export interface LookupEntry {
  id: string
  code: string
  name: string
  parentId: string | null
}

export function lookupsQueryOptions<T extends LookupType>(types: readonly T[]) {
  const sorted = [...types].sort()

  return queryOptions({
    queryKey: queryKeys.masterData.lookups(sorted),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<Record<T, LookupEntry[]>>
      >(apiPaths.masterData.lookups, {
        params: { types: sorted.join(",") },
      })

      return unwrapApiPayload(response.data)
    },
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}
