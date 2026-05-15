import { queryOptions } from "@tanstack/react-query"

import { fetchRolesList } from "@/features/roles/api/roles-api"
import { queryKeys } from "@/lib/query-keys"
import { fetchTaxOfficesForFilter } from "@/features/users/api/reference-api"

/** Shared stale window for admin reference selects (filters, forms). */
export const ADMIN_REFERENCE_SELECT_STALE_MS = 5 * 60 * 1000

export function rolesReferenceSelectQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.admin.referenceSelectOptions.roles(),
    queryFn: fetchRolesList,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function taxOfficesReferenceSelectQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.admin.referenceSelectOptions.taxOffices(),
    queryFn: fetchTaxOfficesForFilter,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}
