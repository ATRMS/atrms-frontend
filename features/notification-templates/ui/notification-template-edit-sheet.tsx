"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"

import {
  editNotificationTemplateSchema,
  type EditNotificationTemplateFormValues,
} from "@/features/notification-templates/schemas"
import {
  insertVariableAtCursor,
  templateBodyFromApi,
} from "@/features/notification-templates/lib/template-body"
import {
  smsCharacterCount,
  substituteTemplateVariables,
} from "@/features/notification-templates/lib/template-preview"
import type { NotificationTemplateListItem } from "@/features/notification-templates/types"
import { useUpdateNotificationTemplateMutation } from "@/features/notification-templates/usecases/update-notification-template.usecase"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export type NotificationTemplateEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: NotificationTemplateListItem
}

function templateToFormValues(
  template: NotificationTemplateListItem
): EditNotificationTemplateFormValues {
  return {
    subject: template.subject ?? "",
    body: templateBodyFromApi(template.body),
    isActive: template.isActive,
  }
}

export function NotificationTemplateEditSheet({
  open,
  onOpenChange,
  template,
}: NotificationTemplateEditSheetProps) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const updateMutation = useUpdateNotificationTemplateMutation()

  const form = useForm<EditNotificationTemplateFormValues>({
    resolver: zodResolver(editNotificationTemplateSchema),
    defaultValues: templateToFormValues(template),
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- preview tab reads live form values
  const bodyValue = form.watch("body")
  const subjectValue = form.watch("subject")

  useEffect(() => {
    if (open) {
      form.reset(templateToFormValues(template))
    }
  }, [open, template, form])

  const previewBody = useMemo(
    () => substituteTemplateVariables(bodyValue),
    [bodyValue]
  )

  const previewSubject = useMemo(
    () =>
      template.channel === "EMAIL"
        ? substituteTemplateVariables(subjectValue)
        : null,
    [subjectValue, template.channel]
  )

  function onSubmit(values: EditNotificationTemplateFormValues) {
    if (template.channel === "EMAIL" && !values.subject.trim()) {
      form.setError("subject", {
        message: "Subject is required for email templates",
      })
      return
    }

    updateMutation.mutate(
      {
        id: template.id,
        payload: {
          subject:
            template.channel === "EMAIL" ? values.subject.trim() || null : null,
          body: values.body,
          isActive: values.isActive,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Edit template</SheetTitle>
          <SheetDescription>
            {template.code} · {template.channel}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {template.isSystem ? (
              <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
                You are editing a system template. Changes apply immediately for
                all outbound messages using this code.
              </p>
            ) : null}

            <Tabs defaultValue="edit" className="gap-4">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit">
                <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
                  <FieldGroup className="gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Channel</span>
                        <Input value={template.channel} readOnly disabled />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Code</span>
                        <Input
                          value={template.code}
                          readOnly
                          disabled
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                    {template.channel === "EMAIL" ? (
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
                      render={({ field, fieldState }) => (
                        <Textarea
                          {...field}
                          ref={(el) => {
                            field.ref(el)
                            bodyRef.current = el
                          }}
                          rows={12}
                          className="font-mono text-sm"
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                  </FieldGroup>

                  <aside className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Available variables
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {template.availableVariables.map((variable) => (
                        <li key={variable}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto w-full justify-start px-2 py-1 font-mono text-xs"
                            onClick={() => {
                              const next = insertVariableAtCursor(
                                form.getValues("body"),
                                variable,
                                bodyRef.current
                              )
                              form.setValue("body", next, { shouldDirty: true })
                            }}
                          >
                            {`{{${variable}}}`}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </aside>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                {template.channel === "EMAIL" ? (
                  <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
                    {previewSubject ? (
                      <p className="text-sm font-semibold">{previewSubject}</p>
                    ) : null}
                    <p className="text-sm whitespace-pre-wrap">{previewBody}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                      {previewBody}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {smsCharacterCount(previewBody)} characters
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? "Saving…"
                : template.isSystem
                  ? "Save changes to system template"
                  : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
