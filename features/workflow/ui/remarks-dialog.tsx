"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function RemarksDialog({
  action,
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  action: "return" | "reject"
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (remarks: string) => void
  pending?: boolean
}) {
  const [remarks, setRemarks] = useState("")
  const invalid = open && remarks.trim().length === 0
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setRemarks("")
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "return" ? "Return for changes" : "Reject proposal"}
          </DialogTitle>
          <DialogDescription>
            Explain what the proposer should know. Remarks are required.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="workflow-remarks">Remarks</FieldLabel>
            <Textarea
              id="workflow-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              aria-invalid={invalid}
              rows={4}
            />
            {invalid ? <FieldError>Remarks are required.</FieldError> : null}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === "reject" ? "destructive" : "default"}
            disabled={invalid || pending}
            onClick={() => onConfirm(remarks.trim())}
          >
            {action === "return" ? "Return" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
