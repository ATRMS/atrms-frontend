"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import type { TransferUserPayload } from "@/features/users/types"
import {
  transferUserFormSchema,
  type TransferUserFormValues,
} from "@/features/users/schemas"
import { useCreateUserTransferMutation } from "@/features/users/usecases/create-user-transfer.usecase"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { notify } from "@/lib/notify"
import { taxOfficesReferenceSelectQueryOptions } from "@/lib/query/admin-reference-select-queries"
import { cn } from "@/lib/utils"

function parseEffectiveDateField(value: string): Date | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const d = parse(trimmed, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

function TransferEffectiveDatePicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string
  onChange: (next: string) => void
  invalid: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = parseEffectiveDateField(value)

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground"
          )}
          aria-invalid={invalid}
        >
          <CalendarIcon
            data-icon="inline-start"
            className="size-4 shrink-0 opacity-60"
          />
          {selected ? format(selected, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("")
              return
            }
            onChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export type TransferUserDialogProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTaxOfficeId: string | null | undefined
}

export function TransferUserDialog({
  userId,
  open,
  onOpenChange,
  currentTaxOfficeId,
}: TransferUserDialogProps) {
  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const activeTaxOffices = taxOffices.filter(
    (t) => t.isActive && t.id !== currentTaxOfficeId
  )

  const currentOfficeName =
    taxOffices.find((t) => t.id === currentTaxOfficeId)?.name ?? "—"

  const transferMutation = useCreateUserTransferMutation(userId)

  const form = useForm<TransferUserFormValues>({
    resolver: zodResolver(transferUserFormSchema),
    defaultValues: {
      toTaxOfficeId: "",
      reason: "",
      effectiveDate: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        toTaxOfficeId: "",
        reason: "",
        effectiveDate: "",
      })
    }
  }, [open, form])

  function onSubmit(values: TransferUserFormValues) {
    const payload: TransferUserPayload = {
      toTaxOfficeId: values.toTaxOfficeId.trim(),
      reason: values.reason.trim(),
      effectiveDate: values.effectiveDate.trim(),
    }

    transferMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false)
        notify.success("Transfer submitted.")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer user</DialogTitle>
          <DialogDescription>
            Move this officer to another tax office on the effective date.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-from-office">From tax office</Label>
              <Input
                id="transfer-from-office"
                readOnly
                value={currentOfficeName}
                tabIndex={-1}
              />
            </div>

            <FormField
              control={form.control}
              name="toTaxOfficeId"
              label="To tax office"
              required
              render={({ field, fieldState }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {activeTaxOffices.map((office) => (
                        <SelectItem key={office.id} value={office.id}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              label="Reason"
              required
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
              )}
            />

            <FormField
              control={form.control}
              name="effectiveDate"
              label="Effective date"
              required
              render={({ field, fieldState }) => (
                <TransferEffectiveDatePicker
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                />
              )}
            />
          </FieldGroup>

          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? "Submitting…" : "Transfer user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
