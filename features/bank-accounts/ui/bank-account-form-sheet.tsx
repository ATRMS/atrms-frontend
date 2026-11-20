"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import {
  bankAccountCreateSchema,
  bankAccountUpdateSchema,
  type BankAccountCreateFormValues,
  type BankAccountUpdateFormValues,
} from "@/features/bank-accounts/schemas"
import type { BankAccountListItem } from "@/features/bank-accounts/types"
import { useCreateBankAccountMutation } from "@/features/bank-accounts/usecases/create-bank-account.usecase"
import { useUpdateBankAccountMutation } from "@/features/bank-accounts/usecases/update-bank-account.usecase"
import { AsyncCommandSelect } from "@/components/shared/async-command-select"
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
import { fetchTaxTypesList } from "@/features/tax-types/api/tax-types-api"
import { currenciesReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"
import { queryKeys } from "@/lib/query-keys"
import { lookupsQueryOptions } from "@/lib/query/lookups"

async function loadActiveTaxTypeSelectOptions(search: string) {
  const res = await fetchTaxTypesList({
    page: 0,
    size: 50,
    isActive: true,
    ...(search.trim() ? { search: search.trim() } : {}),
  })

  return [...res.data]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      value: t.id,
      label: `${t.code} — ${t.name}`,
    }))
}

const taxTypeAsyncSelectQueryKeyPrefix = [
  ...queryKeys.masterData.taxTypesRoot(),
  "async-select",
  "active",
] as const

const emptyCreate: BankAccountCreateFormValues = {
  accountNumber: "",
  accountName: "",
  bankName: "",
  bankCode: "",
  taxTypeId: "",
  currencyId: "",
  revenueHeadId: "",
}

function BankAccountCreateBody({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const createMutation = useCreateBankAccountMutation()
  const { data: currencies = [] } = useQuery(currenciesReferenceQueryOptions())
  const { data: lookups } = useQuery(lookupsQueryOptions(["revenueHeads"]))

  const currencyOptions = useMemo(
    () => [...currencies].sort((a, b) => a.code.localeCompare(b.code)),
    [currencies]
  )
  const defaultCurrencyId = useMemo(
    () => currencies.find((c) => c.isDefault)?.id ?? currencies[0]?.id ?? "",
    [currencies]
  )

  const form = useForm<BankAccountCreateFormValues>({
    resolver: zodResolver(bankAccountCreateSchema),
    defaultValues: emptyCreate,
  })

  useEffect(() => {
    if (open) {
      form.reset(emptyCreate)
    }
  }, [open, form])

  useEffect(() => {
    if (!defaultCurrencyId) return
    const cid = form.getValues("currencyId")
    if (!cid) form.setValue("currencyId", defaultCurrencyId)
  }, [defaultCurrencyId, form])

  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle>Add bank account</SheetTitle>
        <SheetDescription>
          Register a collection account linked to a tax type and currency.
        </SheetDescription>
      </SheetHeader>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((values) => {
          createMutation.mutate(values, {
            onSuccess: () => {
              form.reset(emptyCreate)
              onClose()
            },
          })
        })}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <FieldGroup>
            <FormField
              control={form.control}
              name="accountNumber"
              label="Account number"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
              )}
            />
            <FormField
              control={form.control}
              name="accountName"
              label="Account name"
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
              name="bankName"
              label="Bank name"
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
              name="bankCode"
              label="Bank code"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. 057"
                />
              )}
            />

            <FormField
              control={form.control}
              name="taxTypeId"
              label="Tax type"
              required
              render={({ field, fieldState }) => (
                <AsyncCommandSelect
                  id={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Tax type"
                  aria-invalid={fieldState.invalid}
                  queryKeyPrefix={taxTypeAsyncSelectQueryKeyPrefix}
                  loadOptions={loadActiveTaxTypeSelectOptions}
                />
              )}
            />

            <FormField
              control={form.control}
              name="revenueHeadId"
              label="Revenue head"
              description="Optional — restrict this account to one revenue head."
              render={({ field, fieldState }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? "" : value)
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Any revenue head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__none__">Any revenue head</SelectItem>
                      {(lookups?.revenueHeads ?? []).map((head) => (
                        <SelectItem key={head.id} value={head.id}>
                          {head.code} — {head.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <FormField
              control={form.control}
              name="currencyId"
              label="Currency"
              required
              render={({ field, fieldState }) => (
                <Select
                  value={field.value || undefined}
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
          </FieldGroup>
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </form>
    </>
  )
}

function BankAccountEditBody({
  row,
  onClose,
}: {
  row: BankAccountListItem
  onClose: () => void
}) {
  const updateMutation = useUpdateBankAccountMutation(row.id)
  const { data: lookups } = useQuery(
    lookupsQueryOptions(["currencies", "taxTypes", "revenueHeads"])
  )

  const form = useForm<BankAccountUpdateFormValues>({
    resolver: zodResolver(bankAccountUpdateSchema),
    defaultValues: {
      accountNumber: row.accountNumber,
      accountName: row.accountName,
      bankName: row.bankName,
      bankCode: row.bankCode ?? "",
      currencyId: row.currencyId,
      taxTypeId: row.taxTypeId ?? "",
      revenueHeadId: row.revenueHeadId ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      accountNumber: row.accountNumber,
      accountName: row.accountName,
      bankName: row.bankName,
      bankCode: row.bankCode ?? "",
      currencyId: row.currencyId,
      taxTypeId: row.taxTypeId ?? "",
      revenueHeadId: row.revenueHeadId ?? "",
    })
  }, [row, form])

  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle>Edit bank account</SheetTitle>
        <SheetDescription>
          Update account and bank details. Tax type and currency cannot be
          changed here.
        </SheetDescription>
      </SheetHeader>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((values) => {
          updateMutation.mutate(values, {
            onSuccess: () => onClose(),
          })
        })}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <FieldGroup className="gap-4">
            <FormField
              control={form.control}
              name="accountNumber"
              label="Account number"
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
              name="taxTypeId"
              label="Tax type"
              required
              render={({ field, fieldState }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(lookups?.taxTypes ?? []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.code} — {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="currencyId"
              label="Currency"
              required
              render={({ field, fieldState }) => (
                <Select
                  value={field.value || undefined}
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
                      {(lookups?.currencies ?? []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.code} — {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="revenueHeadId"
              label="Revenue head"
              render={({ field, fieldState }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? "" : value)
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Any revenue head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__none__">Any revenue head</SelectItem>
                      {(lookups?.revenueHeads ?? []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.code} — {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="accountName"
              label="Account name"
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
              name="bankName"
              label="Bank name"
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
              name="bankCode"
              label="Bank code"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
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
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </form>
    </>
  )
}

export type BankAccountFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankAccount: BankAccountListItem | null
}

export function BankAccountFormSheet({
  open,
  onOpenChange,
  bankAccount,
}: BankAccountFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-md"
      >
        {bankAccount ? (
          <BankAccountEditBody
            key={bankAccount.id}
            row={bankAccount}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <BankAccountCreateBody
            key="create"
            open={open}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
