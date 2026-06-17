export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"

export type AuditResult = "SUCCESS" | "FAILURE" | "PARTIAL"

export type AuditEntityType =
  | "ASSESSMENT"
  | "PAYMENT"
  | "USER"
  | "TAXPAYER"
  | "ROLE"
  | "GLOBAL_SETTINGS"
  | "NOTIFICATION_TEMPLATE"
  | "SYSTEM"

export type AuditLogListItem = {
  id: string
  entityType: string
  entityId: string
  action: AuditAction
  actorId: string | null
  actorUsername: string | null
  ipAddress: string | null
  result: AuditResult
  failureReason: string | null
  createdAt: string
}

export type AuditLogDetail = AuditLogListItem & {
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
}

export type AuditLogParams = {
  from: string
  to: string
  entityType?: string
  action?: AuditAction
  actorId?: string
  result?: AuditResult
  page?: number
  size?: number
}
