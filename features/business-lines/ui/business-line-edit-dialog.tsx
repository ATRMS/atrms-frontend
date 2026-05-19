"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { BusinessLineListItem } from "@/features/business-lines/types"
import {
  updateBusinessLineSchema,
  type UpdateBusinessLineFormValues,
} from "@/features/business-lines/schemas"
import { useUpdateBusinessLineMutation } from "@/features/business-lines/usecases/update-business-line.usecase"
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

export type BusinessLineEditDialogProps = {
  line: BusinessLineListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BusinessLineEditDialog({
  line,
  open,
  onOpenChange,
}: BusinessLineEditDialogProps) {
  const updateMutation = useUpdateBusinessLineMutation(line.id)

  const form = useForm<UpdateBusinessLineFormValues>({
    resolver: zodResolver(updateBusinessLineSchema),
    defaultValues: { name: "", sector: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: line.name,
        sector: line.sector ?? "",
      })
    }
  }, [open, line, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit business line</DialogTitle>
          <DialogDescription>
            The code cannot be changed after creation.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            updateMutation.mutate(
              {
                name: values.name.trim(),
                sector: values.sector?.trim() || undefined,
                code: line.code,
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
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Code
              </span>
              <span className="font-mono text-sm">{line.code}</span>
            </div>

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
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
