"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  tinRequestRejectFormSchema,
  type TinRequestRejectFormValues,
} from "@/features/tin-requests/schemas"
import { useRejectTinRequestMutation } from "@/features/tin-requests/usecases/reject-tin-request.usecase"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const emptyReject: TinRequestRejectFormValues = {
  reason: "",
}

export type RejectTinRequestDialogProps = {
  requestId: string | null
  onOpenChange: (open: boolean) => void
}

export function RejectTinRequestDialog({
  requestId,
  onOpenChange,
}: RejectTinRequestDialogProps) {
  const open = Boolean(requestId)
  const rejectMutation = useRejectTinRequestMutation()

  const form = useForm<TinRequestRejectFormValues>({
    resolver: zodResolver(tinRequestRejectFormSchema),
    defaultValues: emptyReject,
  })

  useEffect(() => {
    if (open) form.reset(emptyReject)
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject TIN request</DialogTitle>
          <DialogDescription>
            Provide a reason. The requester may reference this when revising
            their registration.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            if (!requestId) return
            rejectMutation.mutate(
              { id: requestId, reason: values.reason },
              {
                onSuccess: () => {
                  form.reset(emptyReject)
                  onOpenChange(false)
                },
              }
            )
          })}
        >
          <FieldGroup>
            <FormField
              control={form.control}
              name="reason"
              label="Reason"
              required
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  rows={4}
                  placeholder="Explain why this request is rejected"
                />
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
