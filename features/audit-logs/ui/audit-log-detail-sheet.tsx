"use client"

import { format, isValid, parseISO } from "date-fns"
import Link from "next/link"

import {
  AuditActionBadge,
  AuditEntityTypeBadge,
  AuditResultBadge,
} from "@/features/audit-logs/lib/audit-log-display"
import { useAuditLogDetailQuery } from "@/features/audit-logs/usecases/audit-logs.usecase"
import type { AuditLogListItem } from "@/features/audit-logs/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { notify } from "@/lib/notify"

function JsonBlock({
  title,
  value,
}: {
  title: string
  value: Record<string, unknown> | null | undefined
}) {
  const text =
    value == null
      ? "—"
      : JSON.stringify(value, null, 2)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {text}
      </pre>
    </div>
  )
}

export function AuditLogDetailSheet({
  open,
  onOpenChange,
  auditLogId,
  listItem,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditLogId: string
  listItem: AuditLogListItem
}) {
  const detailQuery = useAuditLogDetailQuery(auditLogId, open)

  const detail = detailQuery.data ?? listItem
  const parsed = parseISO(detail.createdAt)
  const timestamp = isValid(parsed)
    ? format(parsed, "MMM d, yyyy h:mm a")
    : detail.createdAt

  const fullDetail = detailQuery.data
  const showDiff = Boolean(fullDetail)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Audit log details</SheetTitle>
          <SheetDescription>{timestamp}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {detailQuery.isPending && !detailQuery.data ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailQuery.isError ? (
            <p className="text-sm text-destructive">
              {(detailQuery.error as Error)?.message ??
                "Failed to load details."}
            </p>
          ) : (
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Timestamp</dt>
                <dd className="font-medium">{timestamp}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Entity type</dt>
                <dd>
                  <AuditEntityTypeBadge entityType={detail.entityType} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Entity ID</dt>
                <dd className="flex items-center gap-2 font-mono text-xs">
                  {detail.entityId}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(detail.entityId)
                        .then(
                          () => notify.success("Entity ID copied."),
                          () => notify.error("Could not copy.")
                        )
                    }}
                  >
                    Copy
                  </Button>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Action</dt>
                <dd>
                  <AuditActionBadge action={detail.action} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Actor</dt>
                <dd>
                  {detail.actorId ? (
                    <Link
                      href={`/admin/users/${detail.actorId}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {detail.actorUsername?.trim() || detail.actorId}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">IP address</dt>
                <dd className="font-mono text-xs">
                  {detail.ipAddress?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Result</dt>
                <dd>
                  <AuditResultBadge result={detail.result} />
                </dd>
              </div>
              {detail.result === "FAILURE" && detail.failureReason ? (
                <div>
                  <dt className="text-muted-foreground">Failure reason</dt>
                  <dd className="text-destructive">{detail.failureReason}</dd>
                </div>
              ) : null}
            </dl>
          )}

          {showDiff && fullDetail ? (
            <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-2">
              <JsonBlock
                title="Before (old values)"
                value={
                  fullDetail.action === "CREATE"
                    ? null
                    : fullDetail.oldValues ?? null
                }
              />
              <JsonBlock
                title="After (new values)"
                value={
                  fullDetail.action === "DELETE"
                    ? null
                    : fullDetail.newValues ?? null
                }
              />
            </div>
          ) : null}
        </div>

        <SheetFooter className="shrink-0 border-t bg-muted/30 sm:justify-end">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
