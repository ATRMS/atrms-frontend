import type { AuditAction, AuditResult } from "@/features/audit-logs/types"
import { Badge } from "@/components/ui/badge"

const ACTION_VARIANT: Record<
  AuditAction,
  "default" | "secondary" | "destructive" | "outline" | "pending"
> = {
  CREATE: "default",
  UPDATE: "pending",
  DELETE: "destructive",
  LOGIN: "secondary",
  LOGOUT: "secondary",
  VIEW: "outline",
}

const ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  LOGIN: "Login",
  LOGOUT: "Logout",
  VIEW: "View",
}

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <Badge variant={ACTION_VARIANT[action] ?? "secondary"}>
      {ACTION_LABEL[action] ?? action}
    </Badge>
  )
}

const RESULT_VARIANT: Record<
  AuditResult,
  "success" | "destructive" | "pending" | "secondary"
> = {
  SUCCESS: "success",
  FAILURE: "destructive",
  PARTIAL: "pending",
}

export function AuditResultBadge({ result }: { result: AuditResult }) {
  return <Badge variant={RESULT_VARIANT[result] ?? "secondary"}>{result}</Badge>
}

export function AuditEntityTypeBadge({ entityType }: { entityType: string }) {
  return <Badge variant="outline">{entityType}</Badge>
}
