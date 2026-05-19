"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"

import { fetchRevenueTargetsList } from "@/features/revenue-targets/api/revenue-targets-api"
import {
  formatThousandsGrouping,
  getCurrentCalendarYear,
} from "@/features/revenue-targets/lib/revenue-target-format"
import {
  revenueTargetFormSchema,
  type RevenueTargetFormInputValues,
  type RevenueTargetFormValues,
} from "@/features/revenue-targets/schemas"
import type { RevenueTargetListItem } from "@/features/revenue-targets/types"
import { useCreateRevenueTargetMutation } from "@/features/revenue-targets/usecases/create-revenue-target.usecase"
import { useUpdateRevenueTargetMutation } from "@/features/revenue-targets/usecases/update-revenue-target.usecase"
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
import {
  currenciesReferenceQueryOptions,
  taxTypesActiveReferenceQueryOptions,
} from "@/lib/query/admin-reference-select-queries"
import { queryKeys } from "@/lib/query-keys"

function amountToInputDisplay(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export type RevenueTargetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Row edit from grid; null when opening “Set target”. */
  editingRow: RevenueTargetListItem | null
}

export function RevenueTargetDialog({
  open,
  onOpenChange,
  editingRow,
}: RevenueTargetDialogProps) {
  const currentYear = getCurrentCalendarYear()

  const emptyDefaults: RevenueTargetFormInputValues = useMemo(
    () => ({
      taxTypeId: "",
      fiscalYear: currentYear,
      currencyId: "",
      targetAmount: "",
    }),
    [currentYear]
  )

  const [resolvedId, setResolvedId] = useState<string | null>(null)

  const updateId = editingRow?.id ?? resolvedId ?? ""

  const createMutation = useCreateRevenueTargetMutation()
  const updateMutation = useUpdateRevenueTargetMutation(updateId)

  const { data: taxTypes = [] } = useQuery(taxTypesActiveReferenceQueryOptions())
  const { data: currencies = [] } = useQuery(currenciesReferenceQueryOptions())

  const taxTypeOptions = useMemo(
    () => [...taxTypes].sort((a, b) => a.name.localeCompare(b.name)),
    [taxTypes]
  )

  const currencyOptions = useMemo(
    () => [...currencies].sort((a, b) => a.code.localeCompare(b.code)),
    [currencies]
  )

  const defaultCurrencyId = useMemo(
    () => currencies.find((c) => c.isDefault)?.id ?? currencies[0]?.id ?? "",
    [currencies]
  )

  const form = useForm<
    RevenueTargetFormInputValues,
    unknown,
    RevenueTargetFormValues
  >({
    resolver: zodResolver(
      revenueTargetFormSchema
    ) as Resolver<
      RevenueTargetFormInputValues,
      unknown,
      RevenueTargetFormValues
    >,
    defaultValues: emptyDefaults,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedType = form.watch("taxTypeId")
  const watchedYear = form.watch("fiscalYear")

  const lookupFiscalYear =
    typeof watchedYear === "number" && Number.isFinite(watchedYear)
      ? watchedYear
      : undefined

  const lookupQuery = useQuery({
    queryKey: [
      ...queryKeys.masterData.revenueTargetsRoot(),
      "lookup",
      watchedType,
      watchedYear,
    ] as const,
    queryFn: () =>
      fetchRevenueTargetsList({
        page: 0,
        size: 10,
        taxTypeId: watchedType,
        ...(lookupFiscalYear !== undefined
          ? { fiscalYear: lookupFiscalYear }
          : {}),
      }),
    enabled:
      open &&
      editingRow === null &&
      Boolean(watchedType && lookupFiscalYear !== undefined),
  })

  useEffect(() => {
    if (!open) {
      setResolvedId(null)
      form.reset(emptyDefaults)
      return
    }

    if (editingRow) {
      setResolvedId(editingRow.id)
      form.reset({
        taxTypeId: editingRow.taxTypeId,
        fiscalYear: editingRow.fiscalYear,
        currencyId: editingRow.currencyId,
        targetAmount: amountToInputDisplay(editingRow.targetAmount),
      })
      return
    }

    form.reset({
      ...emptyDefaults,
      currencyId: defaultCurrencyId || "",
    })
    setResolvedId(null)
  }, [open, editingRow, emptyDefaults, defaultCurrencyId, form])

  useEffect(() => {
    if (!open || editingRow || !defaultCurrencyId) return
    const cid = form.getValues("currencyId")
    if (!cid) {
      form.setValue("currencyId", defaultCurrencyId)
    }
  }, [open, editingRow, defaultCurrencyId, form])

  useEffect(() => {
    if (!open || editingRow) return
    if (lookupFiscalYear === undefined) return
    if (!lookupQuery.isFetched) return

    const hit = lookupQuery.data?.data?.[0]
    if (
      hit &&
      hit.taxTypeId === watchedType &&
      hit.fiscalYear === lookupFiscalYear
    ) {
      setResolvedId(hit.id)
      form.setValue("currencyId", hit.currencyId)
      form.setValue("targetAmount", amountToInputDisplay(hit.targetAmount))
    } else {
      setResolvedId(null)
      form.setValue("targetAmount", "")
      if (defaultCurrencyId) {
        form.setValue("currencyId", defaultCurrencyId)
      }
    }
  }, [
    open,
    editingRow,
    lookupFiscalYear,
    lookupQuery.isFetched,
    lookupQuery.data,
    watchedType,
    defaultCurrencyId,
    form,
  ])

  const isPending = createMutation.isPending || updateMutation.isPending

  const editingTaxType = editingRow
    ? taxTypes.find((t) => t.id === editingRow.taxTypeId)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingRow ? "Edit revenue target" : "Set revenue target"}
          </DialogTitle>
          <DialogDescription>
            {editingRow
              ? "Adjust amount or currency for this fiscal year."
              : resolvedId
                ? "A target already exists for this tax type and year — saving will update it."
                : "Choose tax type and fiscal year. Amounts use the selected currency."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            const id = editingRow?.id ?? resolvedId

            if (id) {
              updateMutation.mutate(values, {
                onSuccess: () => onOpenChange(false),
              })
            } else {
              createMutation.mutate(values, {
                onSuccess: () => onOpenChange(false),
              })
            }
          })}
        >
          <FieldGroup>
            {editingRow ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Tax type
                  </span>
                  <span className="text-sm">
                    {editingTaxType
                      ? `${editingTaxType.code} — ${editingTaxType.name}`
                      : editingRow.taxTypeId}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Fiscal year
                  </span>
                  <span className="text-sm">{editingRow.fiscalYear}</span>
                </div>
              </>
            ) : (
              <>
                <FormField<
                  RevenueTargetFormInputValues,
                  "taxTypeId",
                  RevenueTargetFormValues
                >
                  control={form.control}
                  name="taxTypeId"
                  label="Tax type"
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
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {taxTypeOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.code} — {t.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormField<
                  RevenueTargetFormInputValues,
                  "fiscalYear",
                  RevenueTargetFormValues
                >
                  control={form.control}
                  name="fiscalYear"
                  label="Fiscal year"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={2000}
                      max={2100}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? ""
                            : Number.parseInt(e.target.value, 10)
                        )
                      }
                      value={field.value === "" ? "" : field.value}
                    />
                  )}
                />
              </>
            )}

            <FormField<
              RevenueTargetFormInputValues,
              "currencyId",
              RevenueTargetFormValues
            >
              control={form.control}
              name="currencyId"
              label="Currency"
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
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {currencyOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.symbol} {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <FormField<
              RevenueTargetFormInputValues,
              "targetAmount",
              RevenueTargetFormValues
            >
              control={form.control}
              name="targetAmount"
              label="Target amount"
              required
              render={({ field, fieldState }) => (
                <Input
                  id={field.name}
                  inputMode="decimal"
                  aria-invalid={fieldState.invalid}
                  placeholder="0"
                  value={field.value}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "")
                    if (raw === "") {
                      field.onChange("")
                      return
                    }
                    if (!/^\d*\.?\d{0,2}$/.test(raw)) return
                    const [whole, frac] = raw.split(".")
                    const grouped = formatThousandsGrouping(whole)
                    field.onChange(frac !== undefined ? `${grouped}.${frac}` : grouped)
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
