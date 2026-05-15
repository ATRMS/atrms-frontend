"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  createRoleDetailsSchema,
  normalizeRoleCodeInput,
  type CreateRoleDetailsValues,
} from "@/features/roles/schemas"
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
import { Textarea } from "@/components/ui/textarea"

export type CreateRoleDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: CreateRoleDetailsValues | null
  onContinue: (values: CreateRoleDetailsValues) => void
}

export function CreateRoleDetailsDialog({
  open,
  onOpenChange,
  defaultValues,
  onContinue,
}: CreateRoleDetailsDialogProps) {
  const form = useForm<CreateRoleDetailsValues>({
    resolver: zodResolver(createRoleDetailsSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        code: defaultValues?.code ?? "",
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
      })
    }
  }, [open, defaultValues, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>
            Step 1 of 2 — enter the role code and display name. Permission
            assignment follows next.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            onContinue({
              ...values,
              code: normalizeRoleCodeInput(values.code),
              description: values.description?.trim() || undefined,
            })
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
                  placeholder="e.g. AUDITOR"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    field.onChange(normalizeRoleCodeInput(e.target.value))
                  }}
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
              name="description"
              label="Description"
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  rows={3}
                  aria-invalid={fieldState.invalid}
                  placeholder="Optional"
                  value={field.value ?? ""}
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
            <Button type="submit">Next: Configure permissions →</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
