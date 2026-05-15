"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchRolePermissions } from "@/features/roles/api/roles-api"
import { queryKeys } from "@/lib/query-keys"

export function useRolePermissionsQuery(
  roleId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.roles.permissions(roleId),
    queryFn: () => fetchRolePermissions(roleId),
    enabled: options?.enabled ?? true,
  })
}
