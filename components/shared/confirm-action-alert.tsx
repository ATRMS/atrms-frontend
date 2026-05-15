"use client"

import type { ComponentProps, ReactNode } from "react"
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

export type ConfirmActionAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  cancelLabel?: string
  confirmLabel: string
  pendingLabel?: string
  confirmVariant?: ComponentProps<typeof Button>["variant"]
  /** Extra disabled reasons for the confirm button (for example missing selection). */
  confirmDisabled?: boolean
  isPending: boolean
  onConfirm: () => void
}

export function ConfirmActionAlert({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  pendingLabel = "Updating…",
  confirmVariant = "default",
  confirmDisabled = false,
  isPending,
  onConfirm,
}: ConfirmActionAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isPending || confirmDisabled}
            onClick={onConfirm}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
