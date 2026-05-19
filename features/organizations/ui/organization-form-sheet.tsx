"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  organizationFormSchema,
  type OrganizationFormInputValues,
} from "@/features/organizations/schemas"
import {
  toOrganizationCreatePayload,
  toOrganizationUpdatePayload,
} from "@/features/organizations/lib/organization-payload"
import type { OrganizationListItem } from "@/features/organizations/types"
import { useCreateOrganizationMutation } from "@/features/organizations/usecases/create-organization.usecase"
import { useUpdateOrganizationMutation } from "@/features/organizations/usecases/update-organization.usecase"
import { fetchBusinessLinesList } from "@/features/business-lines/api/business-lines-api"
import { fetchTaxOfficesList } from "@/features/tax-offices/api/tax-offices-api"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import { queryKeys } from "@/lib/query-keys"

async function loadActiveTaxOfficeSelectOptions(search: string) {
  const res = await fetchTaxOfficesList({
    page: 0,
    size: 50,
    isActive: true,
    ...(search.trim() ? { search: search.trim() } : {}),
  })

  return [...res.data]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => ({
      value: o.id,
      label: `${o.code} — ${o.name}`,
    }))
}

function createBusinessLineSelectLoader(selectedId: string | undefined) {
  return async function loadBusinessLineSelectOptions(search: string) {
    const trimmed = search.trim()
    const res = await fetchBusinessLinesList({
      page: 0,
      size: trimmed ? 50 : 500,
      ...(trimmed ? { search: trimmed } : {}),
    })

    return [...res.data]
      .filter(
        (l) =>
          l.isActive ||
          (selectedId !== undefined &&
            selectedId !== "" &&
            l.id === selectedId)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((l) => ({
        value: l.id,
        label: `${l.code} — ${l.name}${l.isActive ? "" : " (Inactive)"}`,
      }))
  }
}

const taxOfficeAsyncSelectQueryKeyPrefix = [
  ...queryKeys.masterData.taxOfficesRoot(),
  "async-select",
  "active",
] as const

const emptyDefaults: OrganizationFormInputValues = {
  name: "",
  regNumber: "",
  taxOfficeId: "",
  businessLineId: "",
  address: "",
  phone: "",
  email: "",
  website: "",
}

export type OrganizationFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationListItem | null
}

export function OrganizationFormSheet({
  open,
  onOpenChange,
  organization,
}: OrganizationFormSheetProps) {
  const createMutation = useCreateOrganizationMutation()
  const updateMutation = useUpdateOrganizationMutation(organization?.id ?? "")

  const form = useForm<
    OrganizationFormInputValues
  >({
    resolver: zodResolver(
      organizationFormSchema
    ),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
      return
    }

    if (organization) {
      form.reset({
        name: organization.name,
        regNumber: organization.regNumber ?? "",
        taxOfficeId: organization.taxOfficeId,
        businessLineId: organization.businessLineId,
        address: organization.address,
        phone: organization.phone,
        email: organization.email,
        website: organization.website ?? "",
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [open, organization, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {organization ? "Edit organization" : "Add organization"}
          </SheetTitle>
          <SheetDescription>
            Employer entities used as corporate taxpayers and individual
            employers.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit((values) => {
            if (organization) {
              updateMutation.mutate(toOrganizationUpdatePayload(values), {
                onSuccess: () => onOpenChange(false),
              })
            } else {
              createMutation.mutate(toOrganizationCreatePayload(values), {
                onSuccess: () => {
                  form.reset(emptyDefaults)
                  onOpenChange(false)
                },
              })
            }
          })}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identity
              </p>
              <FieldGroup>
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
                  name="regNumber"
                  label="CAC registration no."
                  description="Optional — unique when provided."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Optional"
                    />
                  )}
                />
              </FieldGroup>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Classification
              </p>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="taxOfficeId"
                  label="Tax office"
                  required
                  render={({ field, fieldState }) => (
                    <AsyncCommandSelect
                      id={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Tax office"
                      aria-invalid={fieldState.invalid}
                      queryKeyPrefix={taxOfficeAsyncSelectQueryKeyPrefix}
                      loadOptions={loadActiveTaxOfficeSelectOptions}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessLineId"
                  label="Business line"
                  required
                  render={({ field, fieldState }) => (
                    <AsyncCommandSelect
                      id={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Business line"
                      aria-invalid={fieldState.invalid}
                      queryKeyPrefix={
                        [
                          ...queryKeys.masterData.businessLinesRoot(),
                          "async-select",
                          "org-form",
                          field.value || "",
                        ] as const
                      }
                      loadOptions={createBusinessLineSelectLoader(
                        field.value || undefined
                      )}
                    />
                  )}
                />
              </FieldGroup>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact
              </p>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="address"
                  label="Address"
                  required
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      rows={3}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  label="Phone"
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
                  name="email"
                  label="Email"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  label="Website"
                  description="Optional."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="https://"
                    />
                  )}
                />
              </FieldGroup>
            </div>
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
