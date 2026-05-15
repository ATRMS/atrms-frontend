"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchPermissionCatalog } from "@/features/roles/api/roles-api"
import { queryKeys } from "@/lib/query-keys"

export function usePermissionCatalogQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.permissions.catalog(),
    queryFn: fetchPermissionCatalog,
    enabled: options?.enabled ?? true,
  })
}
