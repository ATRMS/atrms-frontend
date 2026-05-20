"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parseISO } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { fetchIndividualTaxpayerById } from "@/features/individual-taxpayers/api/individual-taxpayers-api"
import {
  individualProfileEditSchema,
  type IndividualProfileEditFormValues,
} from "@/features/individual-taxpayers/schemas"
import {
  formatAnnualIncomeInputDisplay,
  formatIndividualAnnualIncome,
  genderLabel,
  maritalStatusLabel,
  parseAnnualIncomeToNumber,
  TaxpayerStatusBadge,
} from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { buildIndividualUpdatePayload } from "@/features/individual-taxpayers/lib/profile-patch"
import type { IndividualTaxpayerDetail } from "@/features/individual-taxpayers/types"
import { DobPicker } from "@/features/individual-taxpayers/ui/dob-picker"
import { useDeleteTaxpayerMutation } from "@/features/individual-taxpayers/usecases/delete-taxpayer.usecase"
import { useUpdateIndividualTaxpayerMutation } from "@/features/individual-taxpayers/usecases/update-individual-taxpayer.usecase"
import { TaxpayerDeleteConfirmAlert } from "@/features/taxpayers/ui/taxpayer-delete-confirm-alert"
import { TaxpayerStatusDropdown } from "@/features/taxpayers/ui/taxpayer-status-dropdown"
import { loadActiveOrganizationsAsyncOptions } from "@/features/organizations/lib/async-command-select-options"
import { loadActiveProfessionsAsyncOptions } from "@/features/professions/lib/async-command-select-options"
import { BackLink } from "@/components/shared/back-link"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
import { FormField } from "@/components/shared/form-field"
import { ProfileReadOnlyField } from "@/components/shared/profile-read-only-field"
import { TaxOfficeLookup } from "@/components/shared/tax-office-lookup"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
import { PermissionGate } from "@/components/layout/permission-gate"
import { Badge } from "@/components/ui/badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { queryKeys } from "@/lib/query-keys"
import {
  organizationsActiveReferenceQueryOptions,
  professionsActiveReferenceQueryOptions,
  taxOfficesActiveReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"
import { notify } from "@/lib/notify"

function fullDisplayName(d: IndividualTaxpayerDetail): string {
  const parts = [d.firstName, d.middleName?.trim(), d.lastName].filter(Boolean)
  return parts.join(" ").replace(/\s+/g, " ").trim()
}

function detailToFormValues(d: IndividualTaxpayerDetail): IndividualProfileEditFormValues {
  return {
    firstName: d.firstName,
    middleName: d.middleName?.trim() ?? "",
    lastName: d.lastName,
    dateOfBirth: d.dateOfBirth,
    gender: d.gender,
    maritalStatus: d.maritalStatus,
    nationality: d.nationality,
    nin: d.nin?.trim() ?? "",
    bvn: d.bvn?.trim() ?? "",
    phone: d.phone,
    email: d.email,
    address: d.address,
    lgaOfOrigin: d.lgaOfOrigin,
    stateOfOrigin: d.stateOfOrigin,
    taxOfficeId: d.taxOfficeId,
    professionId: d.professionId?.trim() ?? "",
    employerId: d.employerId?.trim() ?? "",
    annualIncome: formatAnnualIncomeInputDisplay(
      parseAnnualIncomeToNumber(d.annualIncome)
    ),
  }
}

function DetailLoaded({
  taxpayerId,
  detail,
}: {
  taxpayerId: string
  detail: IndividualTaxpayerDetail
}) {
  const router = useRouter()

  const { data: professions = [] } = useQuery(
    professionsActiveReferenceQueryOptions()
  )

  const { data: organizations = [] } = useQuery(
    organizationsActiveReferenceQueryOptions()
  )

  const { data: activeTaxOffices = [], isPending: taxOfficesPending } =
    useQuery(taxOfficesActiveReferenceQueryOptions())

  const sortedTaxOffices = [...activeTaxOffices].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const updateMutation = useUpdateIndividualTaxpayerMutation(taxpayerId)
  const deleteMutation = useDeleteTaxpayerMutation()

  const professionLabel = useMemo(() => {
    const id = detail.professionId?.trim()
    if (!id) return undefined
    const p = professions.find((x) => x.id === id)
    return p ? `${p.code} — ${p.name}` : undefined
  }, [detail.professionId, professions])

  const employerLabel = useMemo(() => {
    const id = detail.employerId?.trim()
    if (!id) return undefined
    const o = organizations.find((x) => x.id === id)
    return o
      ? `${o.regNumber ? `${o.regNumber} — ` : ""}${o.name}`
      : undefined
  }, [detail.employerId, organizations])

  const registeredFmt = useMemo(() => {
    const parsed = parseISO(detail.registeredAt)
    return isValid(parsed)
      ? format(parsed, "MMM d, yyyy h:mm a")
      : detail.registeredAt
  }, [detail.registeredAt])

  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const form = useForm<IndividualProfileEditFormValues>({
    resolver: zodResolver(individualProfileEditSchema),
    defaultValues: detailToFormValues(detail),
  })

  useEffect(() => {
    if (!editing) {
      form.reset(detailToFormValues(detail))
    }
  }, [detail, editing, form])

  const professionAsyncPrefix = [
    ...queryKeys.masterData.professionsRoot(),
    "async-select",
    "individual-detail",
  ] as const

  function exitEdit() {
    form.reset(detailToFormValues(detail))
    setEditing(false)
  }

  return (
    <>
      <BackLink href="/admin/taxpayers/individuals">
        Individual taxpayers
      </BackLink>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-normal">
              {detail.tin}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">
              {fullDisplayName(detail)}
            </h1>
            <TaxpayerStatusBadge status={detail.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Registered {registeredFmt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PermissionGate permission={PermissionCodes.taxpayerUpdate}>
            {editing ? (
              <>
                <Button type="button" variant="outline" onClick={exitEdit}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="individual-profile-edit-form"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            )}
          </PermissionGate>

          <TaxpayerStatusDropdown
            taxpayerId={taxpayerId}
            currentStatus={detail.status}
          />

          <PermissionGate permission={PermissionCodes.taxpayerDelete}>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </PermissionGate>
        </div>
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Profile details
        </h2>

        {editing ? (
          <form
            id="individual-profile-edit-form"
            className="space-y-8"
            onSubmit={form.handleSubmit((values) => {
              const parsed = individualProfileEditSchema.parse(values)
              const patch = buildIndividualUpdatePayload(detail, parsed)
              if (Object.keys(patch).length === 0) {
                notify.info("No changes to save.")
                return
              }
              updateMutation.mutate(patch, {
                onSuccess: () => setEditing(false),
              })
            })}
            noValidate
          >
            <FieldGroup className="gap-4">
              <p className="text-sm font-semibold">Identity</p>
              <div className="grid gap-4 md:grid-cols-2">
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
                  render={({ field, fieldState }) => (
                    <DobPicker
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      invalid={fieldState.invalid}
                    />
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="nationality"
                  label="Nationality"
                  required
                  render={({ field, fieldState }) => (
                    <Input {...field} aria-invalid={fieldState.invalid} />
                  )}
                />
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4 border-t pt-6">
              <p className="text-sm font-semibold">Identification</p>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nin"
                  label="NIN"
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

            <FieldGroup className="gap-4 border-t pt-6">
              <p className="text-sm font-semibold">
                Contact &amp; classification
              </p>
              <div className="grid gap-4 md:grid-cols-2">
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
                name="address"
                label="Address"
                required
                render={({ field, fieldState }) => (
                  <Textarea {...field} aria-invalid={fieldState.invalid} />
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
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
              <FormField
                control={form.control}
                name="professionId"
                label="Profession"
                render={({ field, fieldState }) => (
                  <AsyncCommandSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder="Search professions…"
                    queryKeyPrefix={professionAsyncPrefix}
                    loadOptions={loadActiveProfessionsAsyncOptions}
                    displayLabel={professionLabel}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="employerId"
                label="Employer"
                render={({ field, fieldState }) => (
                  <AsyncCommandSelect
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    placeholder="Search organizations…"
                    queryKeyPrefix={[
                      ...queryKeys.masterData.organizationsRoot(),
                      "async-select",
                      "individual-detail",
                    ]}
                    loadOptions={loadActiveOrganizationsAsyncOptions}
                    displayLabel={employerLabel}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="annualIncome"
                label="Annual income (NGN)"
                required
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
          </form>
        ) : (
          <dl className="grid gap-6 md:grid-cols-2">
            <ProfileReadOnlyField
              label="First name"
              value={detail.firstName}
            />
            <ProfileReadOnlyField
              label="Middle name"
              value={detail.middleName?.trim() || "—"}
            />
            <ProfileReadOnlyField label="Last name" value={detail.lastName} />
            <ProfileReadOnlyField
              label="Date of birth"
              value={detail.dateOfBirth}
            />
            <ProfileReadOnlyField
              label="Gender"
              value={genderLabel(detail.gender)}
            />
            <ProfileReadOnlyField
              label="Marital status"
              value={maritalStatusLabel(detail.maritalStatus)}
            />
            <ProfileReadOnlyField
              label="Nationality"
              value={detail.nationality}
            />
            <ProfileReadOnlyField label="NIN" value={detail.nin?.trim() || "—"} />
            <ProfileReadOnlyField label="BVN" value={detail.bvn?.trim() || "—"} />
            <ProfileReadOnlyField label="Phone" value={detail.phone} />
            <ProfileReadOnlyField label="Email" value={detail.email} />
            <ProfileReadOnlyField
              label="Address"
              value={<span className="whitespace-pre-wrap">{detail.address}</span>}
            />
            <ProfileReadOnlyField
              label="LGA of origin"
              value={detail.lgaOfOrigin}
            />
            <ProfileReadOnlyField
              label="State of origin"
              value={detail.stateOfOrigin}
            />
            <ProfileReadOnlyField
              label="Tax office"
              value={<TaxOfficeLookup taxOfficeId={detail.taxOfficeId} />}
            />
            <ProfileReadOnlyField
              label="Profession"
              value={professionLabel ?? "—"}
            />
            <ProfileReadOnlyField
              label="Employer"
              value={employerLabel ?? "—"}
            />
            <ProfileReadOnlyField
              label="Annual income"
              value={formatIndividualAnnualIncome(detail.annualIncome)}
            />
          </dl>
        )}
      </section>

      <TaxpayerDeleteConfirmAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        displayName={fullDisplayName(detail)}
        tin={detail.tin}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(taxpayerId, {
            onSuccess: () => {
              router.push("/admin/taxpayers/individuals")
            },
          })
        }}
      />
    </>
  )
}

export function IndividualTaxpayerDetailPage({
  taxpayerId,
}: {
  taxpayerId: string
}) {
  const detailQuery = useQuery({
    queryKey: queryKeys.taxpayers.taxpayerDetail(taxpayerId),
    queryFn: () => fetchIndividualTaxpayerById(taxpayerId),
  })

  return (
    <PermissionGate
      permission={PermissionCodes.taxpayerRead}
      fallback={<PermissionDeniedFallback resourceLabel="taxpayer profile" />}
    >
      <div className="flex flex-col gap-2 pb-10">
        {detailQuery.isPending ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full max-w-xl" />
          </div>
        ) : detailQuery.isError ? (
          <p className="text-sm text-destructive">
            {(detailQuery.error as Error)?.message ??
              "Could not load taxpayer profile."}
          </p>
        ) : detailQuery.data ? (
          <DetailLoaded taxpayerId={taxpayerId} detail={detailQuery.data} />
        ) : (
          <p className="text-sm text-muted-foreground">Taxpayer not found.</p>
        )}
      </div>
    </PermissionGate>
  )
}
