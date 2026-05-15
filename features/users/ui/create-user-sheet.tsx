"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateUser } from "@/features/users/usecases/create-user.usecase"
import {
  createUserFormSchema,
  OPTIONAL_SELECT_NONE,
  type CreateUserFormValues,
} from "@/features/users/schemas"
import type { CreateUserPayload } from "@/features/users/types"
import { USER_TITLE_VALUES } from "@/features/users/types"
import { UserCreatedPasswordDialog } from "@/features/users/ui/user-created-password-dialog"
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
import {
  rolesReferenceSelectQueryOptions,
  taxOfficesReferenceSelectQueryOptions,
} from "@/lib/query/admin-reference-select-queries"

const initialCreateValues: CreateUserFormValues = {
  title: OPTIONAL_SELECT_NONE,
  firstName: "",
  middleName: "",
  lastName: "",
  staffId: "",
  email: "",
  username: "",
  phone: "",
  roleCode: "",
  taxOfficeId: OPTIONAL_SELECT_NONE,
}

function toCreatePayload(values: CreateUserFormValues): CreateUserPayload {
  const email = values.email.trim()
  const localPart = email.includes("@")
    ? (email.split("@")[0]?.trim() ?? "")
    : ""

  const payload: CreateUserPayload = {
    email,
    username: values.username?.trim() || localPart,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    roleCode: values.roleCode.trim(),
  }

  const middleName = values.middleName?.trim()
  if (middleName) {
    payload.middleName = middleName
  }

  if (values.title !== OPTIONAL_SELECT_NONE) {
    payload.title = values.title
  }

  const phone = values.phone.trim()
  if (phone) {
    payload.phone = phone
  }

  const staffId = values.staffId.trim()
  if (staffId) {
    payload.staffId = staffId
  }

  if (values.taxOfficeId !== OPTIONAL_SELECT_NONE) {
    const taxOfficeId = values.taxOfficeId.trim()
    if (taxOfficeId) {
      payload.taxOfficeId = taxOfficeId
    }
  }

  return payload
}

export type CreateUserSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  )

  const { data: roles = [] } = useQuery(rolesReferenceSelectQueryOptions())
  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const activeTaxOffices = taxOffices.filter((t) => t.isActive)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: initialCreateValues,
  })

  useEffect(() => {
    if (!open) {
      form.reset(initialCreateValues)
    }
  }, [open, form])

  const createMutation = useCreateUser()

  function handlePasswordDialogChange(next: boolean) {
    setPasswordDialogOpen(next)

    if (!next) {
      setTemporaryPassword(null)
    }
  }

  function onSubmit(values: CreateUserFormValues) {
    createMutation.mutate(toCreatePayload(values), {
      onSuccess: (result) => {
        setTemporaryPassword(result.temporaryPassword ?? null)
        onOpenChange(false)
        setPasswordDialogOpen(true)
      },
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex w-full flex-col gap-0 overflow-hidden p-0  data-[side=right]:sm:max-w-sm"
        >
          <SheetHeader className="border-b">
            <SheetTitle>Create user</SheetTitle>
            <SheetDescription>
              Add an IRS officer account. A welcome email with login
              instructions will be sent when email delivery is configured.
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="title"
                  label="Title"
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={OPTIONAL_SELECT_NONE}>
                            None
                          </SelectItem>
                          {USER_TITLE_VALUES.map((titleOption) => (
                            <SelectItem key={titleOption} value={titleOption}>
                              {titleOption}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  label="First name"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="given-name"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="middleName"
                  label="Middle name"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="additional-name"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  label="Last name"
                  required
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="family-name"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="staffId"
                  label="Staff ID"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
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
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  label="Username"
                  description="Leave blank to use the part before @ in the email."
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="username"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleCode"
                  label="Role"
                  required
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.code}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxOfficeId"
                  label="Tax office"
                  render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={OPTIONAL_SELECT_NONE}>
                            None
                          </SelectItem>
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

                <p className="text-sm text-muted-foreground">
                  A welcome email with login instructions will be sent to the
                  user when outbound email is configured.
                </p>
              </FieldGroup>
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create user"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <UserCreatedPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={handlePasswordDialogChange}
        temporaryPassword={temporaryPassword}
      />
    </>
  )
}
