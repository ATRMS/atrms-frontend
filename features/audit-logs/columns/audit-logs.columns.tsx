"use client"

import { CopyIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"

import type { ColumnDef } from "@tanstack/react-table"

import {
  AuditActionBadge,
  AuditEntityTypeBadge,
  AuditResultBadge,
} from "@/features/audit-logs/lib/audit-log-display"
import { AuditLogRowActions } from "@/features/audit-logs/ui/audit-log-row-actions"
import type { AuditLogListItem } from "@/features/audit-logs/types"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"

function EntityIdCell({ entityId }: { entityId: string }) {
  const short =
    entityId.length > 12 ? `${entityId.slice(0, 8)}…${entityId.slice(-4)}` : entityId

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs" title={entityId}>
        {short}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 shrink-0"
        aria-label="Copy entity ID"
        onClick={() => {
          void navigator.clipboard.writeText(entityId).then(
            () => notify.success("Entity ID copied."),
            () => notify.error("Could not copy to clipboard.")
          )
        }}
      >
        <CopyIcon className="size-3.5" />
      </Button>
    </div>
  )
}

export const auditLogsColumns: ColumnDef<AuditLogListItem>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const parsed = parseISO(row.original.createdAt)
      return (
        <span className="text-sm whitespace-nowrap">
          {isValid(parsed)
            ? format(parsed, "MMM d, yyyy h:mm a")
            : row.original.createdAt}
        </span>
      )
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity type",
    cell: ({ row }) => (
      <AuditEntityTypeBadge entityType={row.original.entityType} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => <EntityIdCell entityId={row.original.entityId} />,
  },
  {
    id: "actor",
    header: "Actor",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.actorUsername?.trim() ||
          row.original.actorId ||
          "—"}
      </span>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP address",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.ipAddress?.trim() || "—"}
      </span>
    ),
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => <AuditResultBadge result={row.original.result} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AuditLogRowActions row={row.original} />,
  },
]
