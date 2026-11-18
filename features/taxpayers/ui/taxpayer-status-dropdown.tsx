"use client"

import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { taxpayerStatusLabel } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import type { TaxpayerStatus } from "@/features/individual-taxpayers/types"
import { usePatchTaxpayerStatusMutation } from "@/features/individual-taxpayers/usecases/patch-taxpayer-status.usecase"
import {
  getAllowedTaxpayerStatusTransitions,
  taxpayerStatusChangeRequiresReason,
} from "@/features/taxpayers/lib/taxpayer-status-transitions"
import { ConfirmActionAlert } from "@/components/shared/confirm-action-alert"
import { PermissionGate } from "@/components/layout/permission-gate"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type TaxpayerStatusDropdownProps = {
  taxpayerId: string
  currentStatus: TaxpayerStatus
}

export function TaxpayerStatusDropdown({
  taxpayerId,
  currentStatus,
}: TaxpayerStatusDropdownProps) {
  const transitions = getAllowedTaxpayerStatusTransitions(currentStatus)
  const statusMutation = usePatchTaxpayerStatusMutation(taxpayerId)

  const [pendingStatus, setPendingStatus] = useState<TaxpayerStatus | null>(
    null
  )
  const [reason, setReason] = useState("")

  if (transitions.length === 0) {
    return null
  }

  const requiresReason =
    pendingStatus !== null && taxpayerStatusChangeRequiresReason(pendingStatus)

  function closeConfirm() {
    setPendingStatus(null)
    setReason("")
  }

  function submitStatusChange() {
    if (!pendingStatus) return

    const trimmedReason = reason.trim()
    if (requiresReason && !trimmedReason) return

    statusMutation.mutate(
      {
        status: pendingStatus,
        ...(requiresReason ? { reason: trimmedReason } : {}),
      },
      { onSuccess: () => closeConfirm() }
    )
  }

  return (
    <PermissionGate permission={PermissionCodes.taxpayerUpdate}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            Change status
            <ChevronDownIcon className="ml-1 size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {transitions.map((status) => (
            <DropdownMenuItem
              key={status}
              onSelect={() => setPendingStatus(status)}
            >
              Set to {taxpayerStatusLabel(status)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {pendingStatus !== null && !requiresReason ? (
        <ConfirmActionAlert
          open
          onOpenChange={(open) => {
            if (!open) closeConfirm()
          }}
          title={`Change status to ${taxpayerStatusLabel(pendingStatus)}?`}
          description="This updates registry visibility for assessments and workflows."
          confirmLabel="Update status"
          pendingLabel="Updating…"
          isPending={statusMutation.isPending}
          onConfirm={submitStatusChange}
        />
      ) : null}

      {pendingStatus !== null && requiresReason ? (
        <AlertDialog
          open
          onOpenChange={(open) => {
            if (!open) closeConfirm()
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Change status to {taxpayerStatusLabel(pendingStatus)}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be easily reversed. Provide a reason for this
                status change.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="taxpayer-status-reason">Reason</Label>
              <Textarea
                id="taxpayer-status-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this status is being applied…"
                rows={3}
                disabled={statusMutation.isPending}
                aria-required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={statusMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  statusMutation.isPending || reason.trim().length === 0
                }
                onClick={submitStatusChange}
              >
                {statusMutation.isPending ? "Updating…" : "Update status"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </PermissionGate>
  )
}
