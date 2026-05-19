"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  createBusinessLineSchema,
  type CreateBusinessLineFormValues,
} from "@/features/business-lines/schemas"
import { useCreateBusinessLineMutation } from "@/features/business-lines/usecases/create-business-line.usecase"
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

export type BusinessLineCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BusinessLineCreateDialog({
  open,
  onOpenChange,
}: BusinessLineCreateDialogProps) {
  const createMutation = useCreateBusinessLineMutation()

  const form = useForm<CreateBusinessLineFormValues>({
    resolver: zodResolver(createBusinessLineSchema),
    defaultValues: { code: "", name: "", sector: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset({ code: "", name: "", sector: "" })
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add business line</DialogTitle>
          <DialogDescription>
            Codes must be unique. Use sector as an optional grouping label for
            reporting.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            createMutation.mutate(
              {
                code: values.code.trim().toUpperCase(),
                name: values.name.trim(),
                sector: values.sector?.trim() || undefined,
              },
              {
                onSuccess: () => {
                  onOpenChange(false)
                },
              }
            )
          })}
        >
          <FieldGroup>
            <FormField
              control={form.control}
              name="code"
              label="Code"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="off"
                  placeholder="e.g. PAYROLL"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name="name"
              label="Name"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Display name"
                />
              )}
            />

            <FormField
              control={form.control}
              name="sector"
              label="Sector"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                  placeholder="Optional grouping label"
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
              {createMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
