"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { loadCorporateEmployerOptions } from "@/features/taxpayers/lib/corporate-employer-select"
import { loadActiveProfessionsAsyncOptions } from "@/features/professions/lib/async-command-select-options"
import {
  registerIndividualFormSchema,
  type RegisterIndividualFormInput,
  type RegisterIndividualFormValues,
} from "@/features/individual-taxpayers/schemas"
import { parseAnnualIncomeToNumber } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { toRegisterIndividualPayload } from "@/features/individual-taxpayers/lib/register-payload"
import { useRegisterIndividualTaxpayerMutation } from "@/features/individual-taxpayers/usecases/register-individual-taxpayer.usecase"
import { DobPicker } from "@/features/individual-taxpayers/ui/dob-picker"
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

const emptyDefaults: RegisterIndividualFormInput = {
  tin: "",
  taxOfficeId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "MALE",
  maritalStatus: "SINGLE",
  nationality: "Nigerian",
  nin: "",
  bvn: "",
  phone: "",
  email: "",
  address: "",
  lgaOfOrigin: "",
  stateOfOrigin: "",
  professionId: "",
  employerId: "",
  annualIncome: "",
}

const professionAsyncQueryKeyPrefix = [
  ...queryKeys.masterData.professionsRoot(),
  "async-select",
  "register-individual",
] as const

export type RegisterIndividualSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set (for example from `?tin=`), the field is read-only. */
  initialTin?: string | null
}

export function RegisterIndividualSheet({
  open,
  onOpenChange,
  initialTin,
}: RegisterIndividualSheetProps) {
  const { data: activeTaxOffices = [], isPending: taxOfficesPending } =
    useQuery(taxOfficesActiveReferenceQueryOptions())

  const sortedTaxOffices = [...activeTaxOffices].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const registerMutation = useRegisterIndividualTaxpayerMutation()

  const form = useForm({
    resolver: zodResolver(registerIndividualFormSchema),
    defaultValues: emptyDefaults,
  })

  const tinLocked = Boolean(initialTin?.trim())

  useEffect(() => {
    if (!open) return

    form.reset({
      ...emptyDefaults,
      ...(initialTin?.trim()
        ? { tin: initialTin.trim(), nationality: "Nigerian" }
        : {}),
    })
  }, [open, initialTin, form])

  function onSubmit(values: RegisterIndividualFormValues) {
    registerMutation.mutate(toRegisterIndividualPayload(values), {
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
          <SheetTitle>Register individual taxpayer</SheetTitle>
          <SheetDescription>
            Capture identity, identification, and classification. TIN may be
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  label="First name"
                  required
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  label="Middle name"
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lastName"
                label="Last name"
                required
                render={({ field, fieldState }) => (
                  <Input {...field} aria-invalid={fieldState.invalid} />
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                label="Date of birth"
                required
                description="Must be at least 16 years old."
                render={({ field, fieldState }) => (
                  <DobPicker
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  label="Gender"
                  required
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  label="Marital status"
                  required
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED">Married</SelectItem>
                        <SelectItem value="DIVORCED">Divorced</SelectItem>
                        <SelectItem value="WIDOWED">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nationality"
                label="Nationality"
                required
                render={({ field, fieldState }) => (
                  <Input {...field} aria-invalid={fieldState.invalid} />
                )}
              />
            </FieldGroup>

            <FieldGroup className="gap-4 border-t pt-4">
              <p className="text-sm font-semibold">Identification</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nin"
                  label="NIN"
                  description="Optional — 11 digits when provided."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      maxLength={11}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="bvn"
                  label="BVN"
                  description="Optional — 11 digits when provided."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      maxLength={11}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4 border-t pt-4">
              <p className="text-sm font-semibold">
                Contact &amp; classification
              </p>

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
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                label="Address"
                required
                render={({ field, fieldState }) => (
                  <Textarea {...field} aria-invalid={fieldState.invalid} />
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lgaOfOrigin"
                  label="LGA of origin"
                  required
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="stateOfOrigin"
                  label="State of origin"
                  required
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
              </div>

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
                      <SelectValue placeholder="Select tax office" />
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

              <FormField
                control={form.control}
                name="professionId"
                label="Profession"
                description="Optional — searchable active professions."
                render={({ field, fieldState }) => (
                  <AsyncCommandSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder="Search professions…"
                    queryKeyPrefix={professionAsyncQueryKeyPrefix}
                    loadOptions={loadActiveProfessionsAsyncOptions}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="employerId"
                label="Employer"
                description="Optional — a registered corporate taxpayer."
                render={({ field, fieldState }) => (
                  <AsyncCommandSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder="Search corporate taxpayers…"
                    queryKeyPrefix={[
                      ...queryKeys.taxpayers.all,
                      "employer-select",
                    ]}
                    loadOptions={loadCorporateEmployerOptions}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="annualIncome"
                label="Annual income (NGN)"
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
                : "Register individual"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
