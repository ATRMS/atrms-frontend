"use client"

import { CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { notify } from "@/lib/notify"

export function UserCreatedPasswordDialog({
  open,
  onOpenChange,
  temporaryPassword,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  temporaryPassword: string | null
}) {
  async function copyPassword() {
    if (!temporaryPassword) {
      return
    }

    try {
      await navigator.clipboard.writeText(temporaryPassword)
      notify.success("Temporary password copied.")
    } catch {
      notify.error("Could not copy. Copy the password manually.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User created</DialogTitle>
          <DialogDescription>
            Share this temporary password with the user securely. It won&apos;t
            be shown again.
          </DialogDescription>
        </DialogHeader>
        {temporaryPassword ? (
          <div className="break-all rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm">
            {temporaryPassword}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No temporary password was returned. If email is configured, the
            user may receive login instructions by mail.
          </p>
        )}
        <DialogFooter showCloseButton={false}>
          {temporaryPassword ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyPassword()}
            >
              <CopyIcon data-icon="inline-start" />
              Copy password
            </Button>
          ) : null}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
