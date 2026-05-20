"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  tinRequestCreateFormSchema,
  type TinRequestCreateFormValues,
} from "@/features/tin-requests/schemas"
import { useCreateTinRequestMutation } from "@/features/tin-requests/usecases/create-tin-request.usecase"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const emptyValues: TinRequestCreateFormValues = {
  taxpayerType: "INDIVIDUAL",
  requesterRef: "",
}

export type SubmitTinRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitTinRequestDialog({
  open,
  onOpenChange,
}: SubmitTinRequestDialogProps) {
  const createMutation = useCreateTinRequestMutation()

  const form = useForm<TinRequestCreateFormValues>({
    resolver: zodResolver(tinRequestCreateFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) form.reset(emptyValues)
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit TIN request</DialogTitle>
          <DialogDescription>
            Request a new taxpayer identification number for registration.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            createMutation.mutate(
              {
                taxpayerType: values.taxpayerType,
                requesterRef: values.requesterRef?.trim()
                  ? values.requesterRef.trim()
                  : undefined,
              },
              {
                onSuccess: () => {
                  form.reset(emptyValues)
                  onOpenChange(false)
                },
              }
            )
          })}
        >
          <FieldGroup>
            <FormField
              control={form.control}
              name="taxpayerType"
              label="Taxpayer type"
              required
              render={({ field, fieldState }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Taxpayer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="requesterRef"
              label="Requester ref"
              description="Optional — NIN, CAC number, or other external reference."
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Optional"
                  autoComplete="off"
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
