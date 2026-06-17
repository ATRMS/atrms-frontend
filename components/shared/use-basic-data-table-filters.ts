"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  createDataTableFilterDefaults,
  parseBasicDataTableFilterUrlState,
  serializeBasicDataTableFilterUrlState,
  type DataTableFilterConfig,
} from "@/components/data-table/data-table-filters"

/** Local filter state (resets on refresh; not shareable). */
export function useBasicDataTableFilters(filters: DataTableFilterConfig[]) {
  const [filterValues, setFilterValues] = useState(() =>
    createDataTableFilterDefaults(filters)
  )

  const onFiltersPatch = useCallback((patch: Record<string, string>) => {
    setFilterValues((prev) => ({ ...prev, ...patch }))
  }, [])

  return { filterValues, onFiltersPatch, setFilterValues }
}

/** URL-synced filters (`?channel=EMAIL`, etc.) — same param rules as `DataTable`. */
export function useUrlSyncedBasicDataTableFilters(
  filters: DataTableFilterConfig[]
) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filterValues = useMemo(
    () =>
      parseBasicDataTableFilterUrlState(
        new URLSearchParams(searchParams.toString()),
        filters
      ),
    [searchParams, filters]
  )

  const onFiltersPatch = useCallback(
    (patch: Record<string, string>) => {
      const next = { ...filterValues, ...patch }
      const qs = serializeBasicDataTableFilterUrlState(next, filters)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [filterValues, filters, pathname, router]
  )

  return { filterValues, onFiltersPatch }
}
