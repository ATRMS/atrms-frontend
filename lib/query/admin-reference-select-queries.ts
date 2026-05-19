import { queryOptions } from "@tanstack/react-query"

import { fetchBusinessLinesReference } from "@/features/business-lines/api/business-lines-api"
import { fetchCurrenciesReference } from "@/features/currencies/api/currencies-api"
import { fetchRegionsReference } from "@/features/regions/api/regions-api"
import { fetchRolesList } from "@/features/roles/api/roles-api"
import {
  fetchTaxTypesActiveReference,
  fetchTaxTypesReference,
} from "@/features/tax-types/api/tax-types-api"
import {
  fetchTaxOfficesActiveReference,
  fetchTaxOfficesReference,
} from "@/features/tax-offices/api/tax-offices-api"
import { queryKeys } from "@/lib/query-keys"

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
    queryKey: queryKeys.masterData.taxOfficesRef(),
    queryFn: fetchTaxOfficesReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function taxOfficesActiveReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.taxOfficesActiveRef(),
    queryFn: fetchTaxOfficesActiveReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function businessLinesReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.businessLinesRef(),
    queryFn: fetchBusinessLinesReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function regionsReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.regionsRef(),
    queryFn: fetchRegionsReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function taxTypesReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.taxTypesRef(),
    queryFn: fetchTaxTypesReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function taxTypesActiveReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.taxTypesActiveRef(),
    queryFn: fetchTaxTypesActiveReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}

export function currenciesReferenceQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.masterData.currenciesRef(),
    queryFn: fetchCurrenciesReference,
    staleTime: ADMIN_REFERENCE_SELECT_STALE_MS,
  })
}
