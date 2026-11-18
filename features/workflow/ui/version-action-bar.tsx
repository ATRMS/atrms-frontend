"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import type { VersionStatus, WorkflowAction } from "@/features/workflow/types"
import { RemarksDialog } from "@/features/workflow/ui/remarks-dialog"

export function VersionActionBar({
  status,
  proposedBy,
  onAction,
  onEdit,
  pending,
}: {
  status: VersionStatus
  proposedBy: string | null
  onAction: (action: WorkflowAction, remarks?: string) => void
  onEdit?: () => void
  pending?: boolean
}) {
  const [remarksAction, setRemarksAction] = useState<
    "return" | "reject" | null
  >(null)
  const userId = useAuthStore((state) => state.user?.id)
  const canApprove = useAuthStore((state) =>
    state.hasPermission(PermissionCodes.masterDataApprove)
  )
  const isMaker = Boolean(userId && proposedBy === userId)
  if (status === "RETURNED" && isMaker)
    return (
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => onAction("submit")}
        >
          Submit again
        </Button>
      </div>
    )
  if (status !== "PROPOSED" || isMaker || !canApprove) return null
  return (
    <>
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
        <Button
          type="button"
          disabled={pending}
          onClick={() => onAction("finalize")}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setRemarksAction("return")}
        >
          Return…
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => setRemarksAction("reject")}
        >
          Reject…
        </Button>
      </div>
      {remarksAction ? (
        <RemarksDialog
          action={remarksAction}
          open
          onOpenChange={(open) => {
            if (!open) setRemarksAction(null)
          }}
          pending={pending}
          onConfirm={(remarks) => onAction(remarksAction, remarks)}
        />
      ) : null}
    </>
  )
}
