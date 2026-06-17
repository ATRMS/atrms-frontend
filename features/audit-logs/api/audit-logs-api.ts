import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  AuditLogDetail,
  AuditLogListItem,
  AuditLogParams,
} from "@/features/audit-logs/types"
import type { ApiResponse, PaginatedListResponse } from "@/types/api"

export async function fetchAuditLogsList(
  params: AuditLogParams
): Promise<PaginatedListResponse<AuditLogListItem>> {
  const res = await apiClient.get<PaginatedListResponse<AuditLogListItem>>(
    apiPaths.auditLogs.collection,
    { params }
  )

  return res.data
}

export async function fetchAuditLogById(id: string): Promise<AuditLogDetail> {
  const res = await apiClient.get<ApiResponse<AuditLogDetail>>(
    apiPaths.auditLogs.detail(id)
  )

  return unwrapApiPayload(res.data)
}
