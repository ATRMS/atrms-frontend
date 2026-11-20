"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { TaxTypeListItem } from "@/features/tax-types/types"
import {
  TAX_TYPE_CATEGORY_VALUES,
  TAX_TYPE_COLLECTING_AUTHORITY_VALUES,
  TAX_TYPE_RATE_TYPE_VALUES,
} from "@/features/tax-types/types"
import {
  taxTypeFormSchema,
  type TaxTypeFormInputValues,
  type TaxTypeFormValues,
} from "@/features/tax-types/schemas"
import { toTaxTypeWritePayload } from "@/features/tax-types/lib/tax-type-payload"
import {
  TAX_TYPE_AUTHORITY_LABELS,
  TAX_TYPE_CATEGORY_LABELS,
  TAX_TYPE_RATE_TYPE_LABELS,
} from "@/features/tax-types/lib/tax-type-display"
import { useCreateTaxTypeMutation } from "@/features/tax-types/usecases/create-tax-type.usecase"
import { useUpdateTaxTypeMutation } from "@/features/tax-types/usecases/update-tax-type.usecase"
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

const emptyDefaults: TaxTypeFormInputValues = {
  code: "",
  name: "",
  category: "DIRECT",
  rateType: "PERCENTAGE",
  defaultRate: undefined,
  collectingAuthority: "STATE",
}

export type TaxTypeFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When null, opens in create mode. */
  taxType: TaxTypeListItem | null
}

export function TaxTypeFormSheet({
  open,
  onOpenChange,
  taxType,
}: TaxTypeFormSheetProps) {
  const createMutation = useCreateTaxTypeMutation()
  const updateMutation = useUpdateTaxTypeMutation(taxType?.id ?? "")

  const form = useForm<TaxTypeFormInputValues, unknown, TaxTypeFormValues>({
    resolver: zodResolver(taxTypeFormSchema),
    defaultValues: emptyDefaults,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const rateType = form.watch("rateType")

  useEffect(() => {
    if (rateType !== "PERCENTAGE" && rateType !== "FIXED") {
      form.setValue("defaultRate", undefined, { shouldValidate: true })
    }
  }, [rateType, form])

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
      return
    }

    if (taxType) {
      form.reset({
        code: taxType.code,
        name: taxType.name,
        category: taxType.category,
        rateType: taxType.rateType,
        defaultRate:
          taxType.defaultRate === null || taxType.defaultRate === undefined
            ? undefined
            : Number(taxType.defaultRate),
        collectingAuthority: taxType.collectingAuthority,
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [open, taxType, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: TaxTypeFormValues) {
    const payload = toTaxTypeWritePayload(values)

    if (taxType) {
      updateMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const showDefaultRate = rateType === "PERCENTAGE" || rateType === "FIXED"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {taxType ? "Edit tax type" : "Create tax type"}
          </SheetTitle>
          <SheetDescription>
            {taxType
              ? "The code cannot be changed after creation."
              : "Define a tax type used across assessments and configurations."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FieldGroup>
              {taxType ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Code
                  </span>
                  <span className="font-mono text-sm">{taxType.code}</span>
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
                      placeholder="e.g. PAYE"
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
                    placeholder="Display name"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="category"
                label="Category"
                required
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TAX_TYPE_CATEGORY_VALUES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {TAX_TYPE_CATEGORY_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name="rateType"
                label="Rate type"
                required
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Rate type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TAX_TYPE_RATE_TYPE_VALUES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {TAX_TYPE_RATE_TYPE_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              {showDefaultRate ? (
                <FormField
                  control={form.control}
                  name="defaultRate"
                  label="Default rate"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      id={field.name}
                      type="number"
                      step="any"
                      aria-invalid={fieldState.invalid}
                      placeholder={
                        rateType === "PERCENTAGE" ? "e.g. 7.5" : "Fixed amount"
                      }
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const raw = e.target.value
                        field.onChange(
                          raw === "" ? undefined : Number.parseFloat(raw)
                        )
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="collectingAuthority"
                label="Collecting authority"
                required
                render={({ field, fieldState }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Authority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TAX_TYPE_COLLECTING_AUTHORITY_VALUES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {TAX_TYPE_AUTHORITY_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
