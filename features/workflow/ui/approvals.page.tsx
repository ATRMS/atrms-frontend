"use client"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useMemo } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchWorkflowInbox } from "@/features/workflow/api/workflow-api"
import type { InboxItem } from "@/features/workflow/types"
import { queryKeys } from "@/lib/query-keys"

function inboxHref(item: InboxItem): string | null {
  const match = item.entityReference.match(/^(.*) v(\d+)$/)
  const code = match?.[1] ?? item.entityReference
  const version = match?.[2] ?? ""
  if (item.entityType === "REVENUE_HEAD_RATE")
    return `/admin/revenue-heads?code=${encodeURIComponent(code)}&version=${version}&tab=rates`
  if (item.entityType === "STATUTORY_PARAMETER")
    return `/admin/parameters/${encodeURIComponent(code)}?version=${version}`
  if (item.entityType === "LEGAL_CITATION")
    return `/admin/legal-citations/${encodeURIComponent(code)}?version=${version}`
  return null
}
export function ApprovalsPage() {
  const columns = useMemo<ColumnDef<InboxItem>[]>(
    () => [
      { accessorKey: "workflowName", header: "Type" },
      {
        accessorKey: "entityReference",
        header: "Reference",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.entityReference}
          </span>
        ),
      },
      { accessorKey: "makerName", header: "Maker" },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: ({ row }) => format(new Date(row.original.submittedAt), "PPp"),
      },
      {
        accessorKey: "dueAt",
        header: "Due",
        cell: ({ row }) =>
          row.original.dueAt ? (
            <span
              className={
                row.original.overdue
                  ? "font-medium text-destructive"
                  : undefined
              }
            >
              {format(new Date(row.original.dueAt), "PPp")}
            </span>
          ) : (
            "—"
          ),
      },
      {
        id: "open",
        header: "",
        cell: ({ row }) => {
          const href = inboxHref(row.original)
          return href ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href}>Open</Link>
            </Button>
          ) : null
        },
      },
    ],
    []
  )
  return (
    <PermissionGate
      permission={PermissionCodes.workflowInbox}
      fallback={<PermissionDeniedFallback resourceLabel="approval inbox" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Approvals awaiting me"
          description="Review master-data proposals that require your action."
        />
        <DataTable
          columns={columns}
          queryKey={queryKeys.workflow.inbox()}
          queryFn={fetchWorkflowInbox}
          filters={[]}
          emptyMessage="No approvals are waiting for you."
        />
      </div>
    </PermissionGate>
  )
}
