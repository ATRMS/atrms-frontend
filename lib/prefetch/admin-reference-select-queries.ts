import "server-only"

import type { QueryClient } from "@tanstack/react-query"

import {
  businessLinesReferenceQueryOptions,
  currenciesReferenceQueryOptions,
  regionsReferenceQueryOptions,
  rolesReferenceSelectQueryOptions,
  taxOfficesActiveReferenceQueryOptions,
  taxOfficesReferenceSelectQueryOptions,
  taxTypesActiveReferenceQueryOptions,
  taxTypesReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"

/**
 * Warms TanStack cache for admin reference selects (filters, form dropdowns).
 * Add more `prefetchQuery(...QueryOptions())` entries as master-data APIs land.
 */
export async function prefetchAdminReferenceSelectQueries(
  queryClient: QueryClient
): Promise<void> {
  await Promise.all([
    queryClient.prefetchQuery(rolesReferenceSelectQueryOptions()),
    queryClient.prefetchQuery(taxOfficesReferenceSelectQueryOptions()),
    queryClient.prefetchQuery(taxOfficesActiveReferenceQueryOptions()),
    queryClient.prefetchQuery(businessLinesReferenceQueryOptions()),
    queryClient.prefetchQuery(regionsReferenceQueryOptions()),
    queryClient.prefetchQuery(taxTypesReferenceQueryOptions()),
    queryClient.prefetchQuery(taxTypesActiveReferenceQueryOptions()),
    queryClient.prefetchQuery(currenciesReferenceQueryOptions()),
  ])
}
