"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { saveCitation } from "@/features/legal-citations/api/legal-citations-api"
import {
  citationSchema,
  type CitationFormValues,
} from "@/features/legal-citations/schemas"
import type { CitationVersion } from "@/features/legal-citations/types"
import { normaliseError } from "@/lib/api/client"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { notify } from "@/lib/notify"
import { queryKeys } from "@/lib/query-keys"

export function CitationFormDialog({
  code,
  version,
  open,
  onOpenChange,
  onSaved,
}: {
  code: string | null
  version?: CitationVersion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (code: string) => void
}) {
  const client = useQueryClient()
  const form = useForm<CitationFormValues>({
    resolver: zodResolver(citationSchema),
    defaultValues: {
      code: code ?? "",
      title: "",
      citationText: "",
      jurisdiction: "STATE",
      law: "",
      section: "",
      documentTypes: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      sourceReference: "",
    },
  })
  useEffect(() => {
    if (open)
      form.reset({
        code: code ?? version?.code ?? "",
        title: version?.title ?? "",
        citationText: version?.citationText ?? "",
        jurisdiction: version?.jurisdiction ?? "STATE",
        law: version?.law ?? "",
        section: version?.section ?? "",
        documentTypes: version?.documentTypes.join(", ") ?? "",
        effectiveFrom:
          version?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
        sourceReference: version?.sourceReference ?? "",
      })
  }, [code, form, open, version])
  const mutation = useMutation({
    mutationFn: (values: CitationFormValues) =>
      saveCitation(
        code,
        version?.status === "RETURNED" ? version.version : null,
        {
          ...values,
          documentTypes: values.documentTypes
            .split(",")
            .map((item) => item.trim().toUpperCase())
            .filter(Boolean),
          section: values.section || null,
          sourceReference: values.sourceReference || null,
        }
      ),
    onSuccess: async (saved) => {
      await client.invalidateQueries({
        queryKey: queryKeys.masterData.resourceRoot("legal-citations"),
      })
      await client.invalidateQueries({ queryKey: queryKeys.workflow.inbox() })
      onOpenChange(false)
      onSaved?.(saved.code)
      notify.success("Citation proposal submitted.")
    },
    onError: (caught) => {
      const error = normaliseError(caught)
      if (
        !applyApiFieldErrors(error, form.setError, {
          "master-data.citation.code-invalid": "code",
          "master-data.citation.jurisdiction-invalid": "jurisdiction",
          "master-data.citation.document-types-invalid": "documentTypes",
          "master-data.citation.source-required": "sourceReference",
          "master-data.citation.exists": "code",
        })
      )
        notify.error(error.message)
    },
  })
  const count = useWatch({ control: form.control, name: "citationText" }).length
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {code ? "Propose citation wording" : "Create legal citation"}
          </DialogTitle>
          <DialogDescription>
            Another administrator must approve this dated wording.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
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
                  readOnly={Boolean(code)}
                  aria-invalid={fieldState.invalid}
                  onChange={(event) =>
                    field.onChange(event.target.value.toUpperCase())
                  }
                />
              )}
            />
            <FormField
              control={form.control}
              name="title"
              label="Title"
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
              name="citationText"
              label="Citation text"
              required
              description={`${count}/2,000 characters`}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  rows={6}
                  maxLength={2000}
                  aria-invalid={fieldState.invalid}
                />
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="jurisdiction"
                label="Jurisdiction"
                required
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="NATIONAL">National</SelectItem>
                        <SelectItem value="STATE">State</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                control={form.control}
                name="law"
                label="Law"
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
                name="section"
                label="Section"
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
                name="documentTypes"
                label="Document types"
                required
                description="Comma-separated codes."
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    onChange={(event) =>
                      field.onChange(event.target.value.toUpperCase())
                    }
                  />
                )}
              />
              <FormField
                control={form.control}
                name="effectiveFrom"
                label="Effective from"
                required
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="sourceReference"
                label="Source reference"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              Submit proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
