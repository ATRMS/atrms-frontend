"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"

import {
  professionCreateSchema,
  professionEditSchema,
  type ProfessionEditFormValues,
} from "@/features/professions/schemas"
import type { ProfessionListItem } from "@/features/professions/types"
import { useCreateProfessionMutation } from "@/features/professions/usecases/create-profession.usecase"
import { useUpdateProfessionMutation } from "@/features/professions/usecases/update-profession.usecase"
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
import { Label } from "@/components/ui/label"

type ProfessionCreateInput = {
  code: string
  name: string
}

type ProfessionCreateOutput = {
  code: string
  name: string
}

const emptyCreate: ProfessionCreateInput = {
  code: "",
  name: "",
}

function ProfessionCreateBody({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const createMutation = useCreateProfessionMutation()

  const form = useForm<ProfessionCreateInput, unknown, ProfessionCreateOutput>({
    resolver: zodResolver(professionCreateSchema) as Resolver<
      ProfessionCreateInput,
      unknown,
      ProfessionCreateOutput
    >,
    defaultValues: emptyCreate,
  })

  useEffect(() => {
    if (open) form.reset(emptyCreate)
  }, [open, form])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add profession</DialogTitle>
        <DialogDescription>
          Codes are stored uppercase and must be unique.
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          createMutation.mutate(values, {
            onSuccess: () => {
              form.reset(emptyCreate)
              onClose()
            },
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
                aria-invalid={fieldState.invalid}
                placeholder="e.g. LAWYER"
                autoComplete="off"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                placeholder="e.g. Legal Practitioner"
              />
            )}
          />
        </FieldGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function ProfessionEditBody({
  profession,
  open,
  onClose,
}: {
  profession: ProfessionListItem
  open: boolean
  onClose: () => void
}) {
  const updateMutation = useUpdateProfessionMutation(profession.id)

  const form = useForm<ProfessionEditFormValues>({
    resolver: zodResolver(professionEditSchema),
    defaultValues: { name: profession.name },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: profession.name })
    }
  }, [open, profession.name, form])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit profession</DialogTitle>
        <DialogDescription>Update the display name.</DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          updateMutation.mutate(
            { code: profession.code, name: values.name },
            {
              onSuccess: () => onClose(),
            }
          )
        })}
      >
        <FieldGroup>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Code
            </Label>
            <span className="font-mono text-sm">{profession.code}</span>
            <p className="text-xs text-muted-foreground">
              Code cannot be changed after creation.
            </p>
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
        </FieldGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export type ProfessionUpsertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profession: ProfessionListItem | null
}

export function ProfessionUpsertDialog({
  open,
  onOpenChange,
  profession,
}: ProfessionUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {profession ? (
          <ProfessionEditBody
            key={profession.id}
            profession={profession}
            open={open}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <ProfessionCreateBody
            key="create"
            open={open}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
