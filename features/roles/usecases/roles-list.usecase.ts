"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchRolesList } from "@/features/roles/api/roles-api"
import { queryKeys } from "@/lib/query-keys"

export function useRolesListQuery() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: fetchRolesList,
  })
}
