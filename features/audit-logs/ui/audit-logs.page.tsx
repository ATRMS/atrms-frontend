"use client"

import { useQuery } from "@tanstack/react-query"
import { format, isValid, parseISO } from "date-fns"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchAuditLogsList } from "@/features/audit-logs/api/audit-logs-api"
import { auditLogsColumns } from "@/features/audit-logs/columns/audit-logs.columns"
import {
  auditDateRangeExceedsMaxDays,
  defaultAuditDateRange,
} from "@/features/audit-logs/lib/audit-date-range"
import { loadAuditActorSelectOptions } from "@/features/audit-logs/lib/audit-actor-select-options"
import type { AuditLogParams } from "@/features/audit-logs/types"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
import { IsoDatePicker } from "@/components/shared/iso-date-picker"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { queryKeys } from "@/lib/query-keys"

const PAGE_SIZE = 50

const ENTITY_TYPE_OPTIONS = [
  { value: "__all__", label: "All entity types" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "PAYMENT", label: "Payment" },
  { value: "USER", label: "User" },
  { value: "TAXPAYER", label: "Taxpayer" },
  { value: "ROLE", label: "Role" },
  { value: "GLOBAL_SETTINGS", label: "Global settings" },
  { value: "NOTIFICATION_TEMPLATE", label: "Notification template" },
  { value: "SYSTEM", label: "System" },
] as const

const ACTION_OPTIONS = [
  { value: "__all__", label: "All actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "VIEW", label: "View" },
] as const

const RESULT_OPTIONS = [
  { value: "__all__", label: "All results" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILURE", label: "Failure" },
  { value: "PARTIAL", label: "Partial" },
] as const

const actorQueryKeyPrefix = [
  ...queryKeys.users.all,
  "audit-actor-select",
] as const

type FilterDraft = {
  from: string
  to: string
  entityType: string
  action: string
  actorId: string
  result: string
}

function buildListParams(draft: FilterDraft, page: number): AuditLogParams {
  return {
    from: draft.from,
    to: draft.to,
    page: Math.max(0, page - 1),
    size: PAGE_SIZE,
    ...(draft.entityType !== "__all__" ? { entityType: draft.entityType } : {}),
    ...(draft.action !== "__all__"
      ? { action: draft.action as AuditLogParams["action"] }
      : {}),
    ...(draft.actorId.trim() ? { actorId: draft.actorId.trim() } : {}),
    ...(draft.result !== "__all__"
      ? { result: draft.result as AuditLogParams["result"] }
      : {}),
  }
}

export function AuditLogsPage() {
  const defaults = defaultAuditDateRange()
  const [draft, setDraft] = useState<FilterDraft>({
    from: defaults.from,
    to: defaults.to,
    entityType: "__all__",
    action: "__all__",
    actorId: "",
    result: "__all__",
  })
  const [submitted, setSubmitted] = useState<AuditLogParams | null>(null)
  const [page, setPage] = useState(1)

  const rangeInvalid = auditDateRangeExceedsMaxDays(draft.from, draft.to)
  const rangeOrderInvalid = draft.from && draft.to && draft.from > draft.to

  const listQuery = useQuery({
    queryKey: queryKeys.auditLogs.lists(submitted ?? {}),
    queryFn: () => fetchAuditLogsList(submitted!),
    enabled: submitted !== null,
  })

  const rows = listQuery.data?.data ?? []
  const meta = listQuery.data?.meta
  const total = meta?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table
  const table = useReactTable({
    columns: auditLogsColumns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  })

  const searchDisabled =
    rangeInvalid || Boolean(rangeOrderInvalid) || !draft.from || !draft.to

  function runSearch(resetPage = true) {
    if (searchDisabled) return
    const nextPage = resetPage ? 1 : page
    if (resetPage) setPage(1)
    setSubmitted(buildListParams(draft, nextPage))
  }

  function goToPage(next: number) {
    setPage(next)
    setSubmitted(buildListParams(draft, next))
  }

  const fromLabel = useMemo(() => {
    const d = parseISO(draft.from)
    return isValid(d) ? format(d, "MMM d, yyyy") : draft.from
  }, [draft.from])

  return (
    <PermissionGate
      permission={PermissionCodes.auditRead}
      fallback={<PermissionDeniedFallback resourceLabel="audit trail" />}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Audit trail"
          description="Select a date range and optional filters, then search."
        />

        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">From</span>
              <IsoDatePicker
                id="audit-from"
                value={draft.from}
                onChange={(from) => setDraft((d) => ({ ...d, from }))}
                invalid={rangeInvalid || Boolean(rangeOrderInvalid)}
                placeholder="Start date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">To</span>
              <IsoDatePicker
                id="audit-to"
                value={draft.to}
                onChange={(to) => setDraft((d) => ({ ...d, to }))}
                invalid={rangeInvalid || Boolean(rangeOrderInvalid)}
                placeholder="End date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Entity type</span>
              <Select
                value={draft.entityType}
                onValueChange={(entityType) =>
                  setDraft((d) => ({ ...d, entityType }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Action</span>
              <Select
                value={draft.action}
                onValueChange={(action) => setDraft((d) => ({ ...d, action }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-[220px] flex-col gap-1.5">
              <span className="text-sm font-medium">Actor</span>
              <AsyncCommandSelect
                value={draft.actorId}
                onValueChange={(actorId) =>
                  setDraft((d) => ({ ...d, actorId }))
                }
                placeholder="Search users…"
                queryKeyPrefix={actorQueryKeyPrefix}
                loadOptions={loadAuditActorSelectOptions}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Result</span>
              <Select
                value={draft.result}
                onValueChange={(result) => setDraft((d) => ({ ...d, result }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              disabled={searchDisabled}
              onClick={() => runSearch(true)}
            >
              Search logs
            </Button>
          </div>

          {rangeInvalid ? (
            <p className="text-sm text-destructive">
              Date range cannot exceed 31 days.
            </p>
          ) : rangeOrderInvalid ? (
            <p className="text-sm text-destructive">
              End date must be on or after {fromLabel}.
            </p>
          ) : submitted === null ? (
            <p className="text-sm text-muted-foreground">
              Choose filters and click Search logs to load results.
            </p>
          ) : null}
        </div>

        {submitted !== null ? (
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {listQuery.isFetching ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {auditLogsColumns.map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : listQuery.isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={auditLogsColumns.length}
                        className="h-24 text-center text-destructive"
                      >
                        {(listQuery.error as Error)?.message ??
                          "Search failed."}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => void listQuery.refetch()}
                        >
                          Retry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={auditLogsColumns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No audit logs match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {meta && total > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page + 1} of {pageCount} · {total} total
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1 || listQuery.isFetching}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= pageCount || listQuery.isFetching}
                    onClick={() => goToPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </PermissionGate>
  )
}
