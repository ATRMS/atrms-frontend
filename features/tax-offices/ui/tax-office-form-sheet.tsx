"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import { regionsReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"
import type { TaxOfficeListItem } from "@/features/tax-offices/types"
import {
  taxOfficeFormSchema,
  type TaxOfficeFormInputValues,
  type TaxOfficeFormValues,
} from "@/features/tax-offices/schemas"
import { toTaxOfficeWritePayload } from "@/features/tax-offices/lib/tax-office-payload"
import { useCreateTaxOfficeMutation } from "@/features/tax-offices/usecases/create-tax-office.usecase"
import { useUpdateTaxOfficeMutation } from "@/features/tax-offices/usecases/update-tax-office.usecase"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
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

const emptyDefaults: TaxOfficeFormInputValues = {
  code: "",
  name: "",
  regionId: "",
  address: "",
  phone: "",
  email: "",
}

export type TaxOfficeFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taxOffice: TaxOfficeListItem | null
}

export function TaxOfficeFormSheet({
  open,
  onOpenChange,
  taxOffice,
}: TaxOfficeFormSheetProps) {
  const createMutation = useCreateTaxOfficeMutation()
  const updateMutation = useUpdateTaxOfficeMutation(taxOffice?.id ?? "")

  const { data: regions = [] } = useQuery(regionsReferenceQueryOptions())

  const regionOptions = useMemo(
    () => [...regions].sort((a, b) => a.name.localeCompare(b.name)),
    [regions]
  )

  const form = useForm<TaxOfficeFormInputValues, unknown, TaxOfficeFormValues>({
    resolver: zodResolver(taxOfficeFormSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
      return
    }

    if (taxOffice) {
      form.reset({
        code: taxOffice.code,
        name: taxOffice.name,
        regionId: taxOffice.regionId,
        address: taxOffice.address,
        phone: taxOffice.phone,
        email: taxOffice.email,
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [open, taxOffice, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: TaxOfficeFormValues) {
    const payload = toTaxOfficeWritePayload(values)

    if (taxOffice) {
      updateMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {taxOffice ? "Edit tax office" : "Add tax office"}
          </SheetTitle>
          <SheetDescription>
            {taxOffice
              ? "Codes cannot be changed after creation."
              : "Register a tax office and link it to a region."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FieldGroup>
              {taxOffice ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Code
                  </span>
                  <span className="font-mono text-sm">{taxOffice.code}</span>
                </div>
              ) : (
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
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. ENU-NORTH"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />
              )}

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
                    placeholder="Office name"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="regionId"
                label="Region"
                required
                render={({ field, fieldState }) => (
                  <Select
                    value={field.value ? field.value : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {regionOptions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.code} — {r.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

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
                    placeholder="Street address"
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
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                    placeholder="+234…"
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
                    placeholder="office@example.gov.ng"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
