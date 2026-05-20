"use client"

import Link from "next/link"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { TinRequestListItem } from "@/features/tin-requests/types"
import { RejectTinRequestDialog } from "@/features/tin-requests/ui/reject-tin-request-dialog"
import { useApproveTinRequestMutation } from "@/features/tin-requests/usecases/approve-tin-request.usecase"
import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function registerHref(row: TinRequestListItem): string {
  const tin = encodeURIComponent(row.generatedTin ?? "")
  if (row.taxpayerType === "INDIVIDUAL") {
    return `/admin/taxpayers/individuals?tin=${tin}`
  }
  return `/admin/taxpayers/corporates?tin=${tin}`
}

export function TinRequestRowActions({ row }: { row: TinRequestListItem }) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null)

  const approveMutation = useApproveTinRequestMutation()

  const canApprove = useAuthStore((s) =>
    s.hasPermission(PermissionCodes.taxpayerApproveTin)
  )

  if (row.status === "PENDING" && canApprove) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setApproveOpen(true)}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRejectRequestId(row.id)}
          >
            Reject
          </Button>
        </div>
        <ConfirmActionAlert
          open={approveOpen}
          onOpenChange={setApproveOpen}
          title="Approve TIN request?"
          description="A TIN will be generated and cannot be reversed."
          confirmLabel="Approve"
          pendingLabel="Approving…"
          isPending={approveMutation.isPending}
          onConfirm={() => {
            approveMutation.mutate(row.id, {
              onSuccess: () => setApproveOpen(false),
            })
          }}
        />
        {rejectRequestId ? (
          <RejectTinRequestDialog
            key={rejectRequestId}
            requestId={rejectRequestId}
            onOpenChange={(next) => {
              if (!next) setRejectRequestId(null)
            }}
          />
        ) : null}
      </>
    )
  }

  if (row.status === "APPROVED" && row.generatedTin) {
    const label =
      row.taxpayerType === "INDIVIDUAL"
        ? "Register individual →"
        : "Register corporate →"

    return (
      <Button variant="link" className="h-auto px-0" asChild>
        <Link href={registerHref(row)}>{label}</Link>
      </Button>
    )
  }

  if (row.status === "REJECTED" && row.rejectedReason) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            View reason
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <p className="text-xs font-medium text-muted-foreground">
            Rejection reason
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {row.rejectedReason}
          </p>
        </PopoverContent>
      </Popover>
    )
  }

  return <span className="text-muted-foreground">—</span>
}
