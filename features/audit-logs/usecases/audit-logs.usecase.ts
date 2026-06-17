"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchAuditLogById } from "@/features/audit-logs/api/audit-logs-api"
import { queryKeys } from "@/lib/query-keys"

export function useAuditLogDetailQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auditLogs.detail(id ?? ""),
    queryFn: () => fetchAuditLogById(id!),
    enabled: enabled && Boolean(id),
  })
}
