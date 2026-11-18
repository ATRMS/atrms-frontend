"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  createNotificationTemplateSchema,
  type CreateNotificationTemplateFormValues,
} from "@/features/notification-templates/schemas"
import { extractVariablesFromBody } from "@/features/notification-templates/lib/template-body"
import type { NotificationChannel } from "@/features/notification-templates/types"
import { useCreateNotificationTemplateMutation } from "@/features/notification-templates/usecases/create-notification-template.usecase"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const emptyDefaults: CreateNotificationTemplateFormValues = {
  code: "",
  channel: "EMAIL",
  subject: "",
  body: "",
  availableVariables: [],
}

export type NotificationTemplateCreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationTemplateCreateSheet({
  open,
  onOpenChange,
}: NotificationTemplateCreateSheetProps) {
  const createMutation = useCreateNotificationTemplateMutation()

  const form = useForm({
    resolver: zodResolver(createNotificationTemplateSchema),
    defaultValues: emptyDefaults,
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- channel drives conditional subject field
  const channel = form.watch("channel")

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
    }
  }, [open, form])

  function onSubmit(values: CreateNotificationTemplateFormValues) {
    const variables = extractVariablesFromBody(values.body)
    createMutation.mutate(
      {
        code: values.code.trim(),
        channel: values.channel as NotificationChannel,
        subject:
          values.channel === "EMAIL" ? values.subject.trim() || null : null,
        body: values.body,
        availableVariables:
          variables.length > 0 ? variables : values.availableVariables,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Add template</SheetTitle>
          <SheetDescription>
            Create a custom notification template. System templates are seeded
            by the platform.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FieldGroup className="gap-4">
              <FormField
                control={form.control}
                name="code"
                label="Code"
                required
                description="Uppercase letters, numbers, underscores."
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    className="font-mono text-xs uppercase"
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="channel"
                label="Channel"
                required
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">EMAIL</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {channel === "EMAIL" ? (
                <FormField
                  control={form.control}
                  name="subject"
                  label="Subject"
                  required
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
              ) : null}
              <FormField
                control={form.control}
                name="body"
                label="Body"
                required
                description="Use {{variableName}} placeholders; variables are inferred on save."
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    rows={10}
                    className="font-mono text-sm"
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </FieldGroup>
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create template"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
