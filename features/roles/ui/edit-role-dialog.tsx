"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { RoleListItem } from "@/features/roles/types"
import {
  updateRoleSchema,
  type UpdateRoleFormValues,
} from "@/features/roles/schemas"
import { useUpdateRoleMutation } from "@/features/roles/usecases/update-role.usecase"
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

export type EditRoleDialogProps = {
  role: RoleListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoleDialog({
  role,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const mutation = useUpdateRoleMutation()

  const form = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    if (open && role) {
      form.reset({
        name: role.name,
        description: role.description ?? "",
      })
    }
  }, [open, role, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Update the display name and description. Permission codes cannot be
            changed here.
          </DialogDescription>
        </DialogHeader>

        {role ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => {
              if (!role) return
              mutation.mutate(
                { roleId: role.id, values },
                {
                  onSuccess: () => onOpenChange(false),
                }
              )
            })}
          >
            <FieldGroup>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Code
                </span>
                <span className="font-mono text-sm">{role.code}</span>
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
