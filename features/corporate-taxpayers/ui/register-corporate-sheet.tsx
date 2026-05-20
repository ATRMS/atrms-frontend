"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { loadActiveBusinessLinesAsyncOptions } from "@/features/business-lines/lib/async-command-select-options"
import {
  CORPORATE_COMPANY_TYPES,
  registerCorporateFormSchema,
  type RegisterCorporateFormInput,
  type RegisterCorporateFormValues,
} from "@/features/corporate-taxpayers/schemas"
import {
  companyTypeLabel,
  parseAnnualIncomeToNumber,
} from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"
import { toRegisterCorporatePayload } from "@/features/corporate-taxpayers/lib/register-payload"
import { useRegisterCorporateTaxpayerMutation } from "@/features/corporate-taxpayers/usecases/register-corporate-taxpayer.usecase"
import { IncorporationDatePicker } from "@/features/corporate-taxpayers/ui/incorporation-date-picker"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
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
import { queryKeys } from "@/lib/query-keys"
import { taxOfficesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"
import { cn } from "@/lib/utils"

const emptyDefaults: RegisterCorporateFormInput = {
  tin: "",
  taxOfficeId: "",
  companyName: "",
  regNumber: "",
  dateOfIncorporation: "",
  companyType: "LIMITED_LIABILITY",
  businessLineId: "",
  phone: "",
  email: "",
  registeredAddress: "",
  operatingAddress: "",
  annualTurnover: "",
  employeeCount: "",
}

export type RegisterCorporateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTin?: string | null
}

export function RegisterCorporateSheet({
  open,
  onOpenChange,
  initialTin,
}: RegisterCorporateSheetProps) {
  const { data: activeTaxOffices = [], isPending: taxOfficesPending } =
    useQuery(taxOfficesActiveReferenceQueryOptions())

  const sortedTaxOffices = [...activeTaxOffices].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const registerMutation = useRegisterCorporateTaxpayerMutation()

  const form = useForm({
    resolver: zodResolver(registerCorporateFormSchema),
    defaultValues: emptyDefaults,
  })

  const tinLocked = Boolean(initialTin?.trim())

  useEffect(() => {
    if (!open) return

    form.reset({
      ...emptyDefaults,
      ...(initialTin?.trim() ? { tin: initialTin.trim() } : {}),
    })
  }, [open, initialTin, form])

  const businessLineAsyncPrefix = [
    ...queryKeys.masterData.businessLinesRoot(),
    "async-select",
    "register-corporate",
  ] as const

  function onSubmit(values: RegisterCorporateFormValues) {
    registerMutation.mutate(toRegisterCorporatePayload(values), {
      onSuccess: () => {
        onOpenChange(false)
        form.reset(emptyDefaults)
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Register corporate taxpayer</SheetTitle>
          <SheetDescription>
            Capture identity, classification, and contact details. TIN may be
            pre-filled from an approved TIN request.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FieldGroup className="gap-4">
            <p className="text-sm font-semibold">Identity</p>

            <FormField
              control={form.control}
              name="tin"
              label="TIN"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  autoComplete="off"
                  readOnly={tinLocked}
                  aria-invalid={fieldState.invalid}
                  className={cn(tinLocked && "bg-muted")}
                />
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              label="Company name"
              required
              render={({ field, fieldState }) => (
                <Input {...field} aria-invalid={fieldState.invalid} />
              )}
            />

            <FormField
              control={form.control}
              name="regNumber"
              label="CAC registration number"
              required
              render={({ field, fieldState }) => (
                <Input {...field} aria-invalid={fieldState.invalid} />
              )}
            />

            <FormField
              control={form.control}
              name="dateOfIncorporation"
              label="Date of incorporation"
              required
              description="Cannot be a future date."
              render={({ field, fieldState }) => (
                <IncorporationDatePicker
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                />
              )}
            />

            <FormField
              control={form.control}
              name="companyType"
              label="Company type"
              required
              render={({ field, fieldState }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Company type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CORPORATE_COMPANY_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {companyTypeLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>

          <FieldGroup className="gap-4 border-t pt-6">
            <p className="text-sm font-semibold">Business classification</p>

            <FormField
              control={form.control}
              name="businessLineId"
              label="Business line"
              required
              description="Search active business lines."
              render={({ field, fieldState }) => (
                <AsyncCommandSelect
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  placeholder="Search business lines…"
                  queryKeyPrefix={businessLineAsyncPrefix}
                  loadOptions={loadActiveBusinessLinesAsyncOptions}
                  aria-invalid={fieldState.invalid}
                />
              )}
            />

            <FormField
              control={form.control}
              name="taxOfficeId"
              label="Tax office"
              required
              render={({ field, fieldState }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={
                    taxOfficesPending || sortedTaxOffices.length === 0
                  }
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Tax office" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedTaxOffices.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.code} — {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>

          <FieldGroup className="gap-4 border-t pt-6">
            <p className="text-sm font-semibold">Contact</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                label="Phone"
                required
                render={({ field, fieldState }) => (
                  <Input {...field} aria-invalid={fieldState.invalid} />
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
                    type="email"
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="registeredAddress"
              label="Registered address"
              required
              render={({ field, fieldState }) => (
                <Textarea {...field} aria-invalid={fieldState.invalid} />
              )}
            />

            <FormField
              control={form.control}
              name="operatingAddress"
              label="Operating address"
              required
              render={({ field, fieldState }) => (
                <Textarea {...field} aria-invalid={fieldState.invalid} />
              )}
            />

            <FormField
              control={form.control}
              name="annualTurnover"
              label="Annual turnover (NGN)"
              required
              description="Digits only — formatted with grouping."
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  inputMode="decimal"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "")
                    field.onChange(raw === "" ? "" : raw)
                  }}
                  value={
                    field.value === "" || field.value == null
                      ? ""
                      : parseAnnualIncomeToNumber(field.value).toLocaleString(
                        "en-NG"
                      )
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name="employeeCount"
              label="Employee count"
              description="Optional — whole number."
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. 45"
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
            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending
                ? "Registering…"
                : "Register corporate"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
