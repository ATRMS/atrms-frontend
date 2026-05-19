"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { CurrencyListItem } from "@/features/currencies/types"
import {
  currencyFormSchema,
  type CurrencyFormInputValues,
  type CurrencyFormValues,
} from "@/features/currencies/schemas"
import { useCreateCurrencyMutation } from "@/features/currencies/usecases/create-currency.usecase"
import { useUpdateCurrencyMutation } from "@/features/currencies/usecases/update-currency.usecase"
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

const emptyDefaults: CurrencyFormInputValues = {
  code: "",
  name: "",
  symbol: "",
}

export type CurrencyUpsertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: CurrencyListItem | null
}

export function CurrencyUpsertDialog({
  open,
  onOpenChange,
  currency,
}: CurrencyUpsertDialogProps) {
  const createMutation = useCreateCurrencyMutation()
  const updateMutation = useUpdateCurrencyMutation(currency?.id ?? "")

  const form = useForm<CurrencyFormInputValues, unknown, CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults)
      return
    }

    if (currency) {
      form.reset({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [open, currency, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currency ? "Edit currency" : "Add currency"}
          </DialogTitle>
          <DialogDescription>
            ISO 4217 codes (e.g. NGN, USD). Symbols appear in formatted amounts.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            const payload = {
              code: values.code,
              name: values.name,
              symbol: values.symbol,
            }

            if (currency) {
              updateMutation.mutate(payload, {
                onSuccess: () => onOpenChange(false),
              })
            } else {
              createMutation.mutate(payload, {
                onSuccess: () => onOpenChange(false),
              })
            }
          })}
        >
          <FieldGroup>
            {currency ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Code
                </span>
                <span className="font-mono text-sm">{currency.code}</span>
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
                    maxLength={3}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. NGN"
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
                  placeholder="e.g. Nigerian Naira"
                />
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              label="Symbol"
              required
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. ₦"
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
