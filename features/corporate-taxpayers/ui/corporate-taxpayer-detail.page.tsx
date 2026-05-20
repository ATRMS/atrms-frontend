"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parseISO } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { PermissionCodes } from "@/features/authentication/lib/permission-codes"
import { loadActiveBusinessLinesAsyncOptions } from "@/features/business-lines/lib/async-command-select-options"
import { fetchCorporateTaxpayerById } from "@/features/corporate-taxpayers/api/corporate-taxpayers-api"
import {
  corporateProfileEditSchema,
  CORPORATE_COMPANY_TYPES,
  type CorporateProfileEditFormValues,
} from "@/features/corporate-taxpayers/schemas"
import {
  companyTypeLabel,
  formatCorporateAnnualTurnover,
  formatTurnoverInputDisplay,
  parseAnnualIncomeToNumber,
  TaxpayerStatusBadge,
} from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"
import { buildCorporateUpdatePayload } from "@/features/corporate-taxpayers/lib/profile-patch"
import type { CorporateTaxpayerDetail } from "@/features/corporate-taxpayers/types"
import { IncorporationDatePicker } from "@/features/corporate-taxpayers/ui/incorporation-date-picker"
import { useDeleteTaxpayerMutation } from "@/features/individual-taxpayers/usecases/delete-taxpayer.usecase"
import { useUpdateCorporateTaxpayerMutation } from "@/features/corporate-taxpayers/usecases/update-corporate-taxpayer.usecase"
import { TaxpayerDeleteConfirmAlert } from "@/features/taxpayers/ui/taxpayer-delete-confirm-alert"
import { TaxpayerStatusDropdown } from "@/features/taxpayers/ui/taxpayer-status-dropdown"
import { ProfileReadOnlyField } from "@/components/shared/profile-read-only-field"
import { TaxOfficeLookup } from "@/components/shared/tax-office-lookup"
import { BackLink } from "@/components/shared/back-link"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
import { FormField } from "@/components/shared/form-field"
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
  businessLinesReferenceQueryOptions,
  taxOfficesActiveReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"
import { notify } from "@/lib/notify"

function detailToFormValues(
  d: CorporateTaxpayerDetail
): CorporateProfileEditFormValues {
  return {
    companyName: d.companyName,
    regNumber: d.regNumber,
    dateOfIncorporation: d.dateOfIncorporation,
    companyType: d.companyType,
    businessLineId: d.businessLineId,
    taxOfficeId: d.taxOfficeId,
    phone: d.phone,
    email: d.email,
    registeredAddress: d.registeredAddress,
    operatingAddress: d.operatingAddress,
    annualTurnover: formatTurnoverInputDisplay(
      parseAnnualIncomeToNumber(d.annualTurnover)
    ),
    employeeCount:
      d.employeeCount !== undefined && d.employeeCount !== null
        ? String(d.employeeCount)
        : "",
  }
}

function BusinessLineLookup({
  businessLineId,
}: {
  businessLineId: string
}) {
  const { data: lines = [] } = useQuery(businessLinesReferenceQueryOptions())

  const label = useMemo(() => {
    const bl = lines.find((x) => x.id === businessLineId)
    if (bl) return `${bl.code} — ${bl.name}`
    return businessLineId
  }, [businessLineId, lines])

  const resolved = lines.some((x) => x.id === businessLineId)

  if (resolved) {
    return <span>{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}

function DetailLoaded({
  taxpayerId,
  detail,
}: {
  taxpayerId: string
  detail: CorporateTaxpayerDetail
}) {
  const router = useRouter()

  const { data: activeTaxOffices = [], isPending: taxOfficesPending } =
    useQuery(taxOfficesActiveReferenceQueryOptions())

  const { data: businessLinesRef = [] } = useQuery(
    businessLinesReferenceQueryOptions()
  )

  const sortedTaxOffices = [...activeTaxOffices].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const updateMutation = useUpdateCorporateTaxpayerMutation(taxpayerId)
  const deleteMutation = useDeleteTaxpayerMutation()

  const businessLineLabel = useMemo(() => {
    const bl = businessLinesRef.find((x) => x.id === detail.businessLineId)
    return bl ? `${bl.code} — ${bl.name}` : undefined
  }, [detail.businessLineId, businessLinesRef])

  const registeredFmt = useMemo(() => {
    const parsed = parseISO(detail.registeredAt)
    return isValid(parsed)
      ? format(parsed, "MMM d, yyyy h:mm a")
      : detail.registeredAt
  }, [detail.registeredAt])

  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const form = useForm<CorporateProfileEditFormValues>({
    resolver: zodResolver(corporateProfileEditSchema),
    defaultValues: detailToFormValues(detail),
  })

  useEffect(() => {
    if (!editing) {
      form.reset(detailToFormValues(detail))
    }
  }, [detail, editing, form])

  const businessLineAsyncPrefix = [
    ...queryKeys.masterData.businessLinesRoot(),
    "async-select",
    "corporate-detail",
  ] as const

  function exitEdit() {
    form.reset(detailToFormValues(detail))
    setEditing(false)
  }

  return (
    <>
      <BackLink href="/admin/taxpayers/corporates">
        Corporate taxpayers
      </BackLink>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-normal">
              {detail.tin}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">
              {detail.companyName}
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
                  form="corporate-profile-edit-form"
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
            id="corporate-profile-edit-form"
            className="space-y-8"
            onSubmit={form.handleSubmit((values) => {
              const parsed = corporateProfileEditSchema.parse(values)
              const patch = buildCorporateUpdatePayload(detail, parsed)
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
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4 border-t pt-6">
              <p className="text-sm font-semibold">Classification</p>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="businessLineId"
                  label="Business line"
                  required
                  render={({ field, fieldState }) => (
                    <AsyncCommandSelect
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Search business lines…"
                      queryKeyPrefix={businessLineAsyncPrefix}
                      loadOptions={loadActiveBusinessLinesAsyncOptions}
                      displayLabel={businessLineLabel}
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
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4 border-t pt-6">
              <p className="text-sm font-semibold">Contact</p>
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="annualTurnover"
                  label="Annual turnover (NGN)"
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
                <FormField
                  control={form.control}
                  name="employeeCount"
                  label="Employee count"
                  description="Optional."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
              </div>
            </FieldGroup>
          </form>
        ) : (
          <dl className="grid gap-6 md:grid-cols-2">
            <ProfileReadOnlyField
              label="Company name"
              value={detail.companyName}
            />
            <ProfileReadOnlyField
              label="CAC registration number"
              value={detail.regNumber}
            />
            <ProfileReadOnlyField
              label="Date of incorporation"
              value={detail.dateOfIncorporation}
            />
            <ProfileReadOnlyField
              label="Company type"
              value={companyTypeLabel(detail.companyType)}
            />
            <ProfileReadOnlyField
              label="Business line"
              value={<BusinessLineLookup businessLineId={detail.businessLineId} />}
            />
            <ProfileReadOnlyField
              label="Tax office"
              value={<TaxOfficeLookup taxOfficeId={detail.taxOfficeId} />}
            />
            <ProfileReadOnlyField label="Phone" value={detail.phone} />
            <ProfileReadOnlyField label="Email" value={detail.email} />
            <ProfileReadOnlyField
              label="Registered address"
              value={
                <span className="whitespace-pre-wrap">
                  {detail.registeredAddress}
                </span>
              }
            />
            <ProfileReadOnlyField
              label="Operating address"
              value={
                <span className="whitespace-pre-wrap">
                  {detail.operatingAddress}
                </span>
              }
            />
            <ProfileReadOnlyField
              label="Annual turnover"
              value={formatCorporateAnnualTurnover(detail.annualTurnover)}
            />
            <ProfileReadOnlyField
              label="Employee count"
              value={
                detail.employeeCount != null ? detail.employeeCount : "—"
              }
            />
          </dl>
        )}
      </section>

      <TaxpayerDeleteConfirmAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        displayName={detail.companyName}
        tin={detail.tin}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(taxpayerId, {
            onSuccess: () => {
              router.push("/admin/taxpayers/corporates")
            },
          })
        }}
      />
    </>
  )
}

export function CorporateTaxpayerDetailPage({
  taxpayerId,
}: {
  taxpayerId: string
}) {
  const detailQuery = useQuery({
    queryKey: queryKeys.taxpayers.corporateTaxpayerDetail(taxpayerId),
    queryFn: () => fetchCorporateTaxpayerById(taxpayerId),
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
