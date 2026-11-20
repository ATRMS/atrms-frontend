"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { UpdateUserPayload, UserDetail } from "@/features/users/types"
import { USER_TITLE_VALUES } from "@/features/users/types"
import {
  OPTIONAL_SELECT_NONE,
  parseUserTitleFormValue,
  updateUserFormSchema,
  type UpdateUserFormValues,
} from "@/features/users/schemas"
import { useUpdateUserMutation } from "@/features/users/usecases/update-user.usecase"
import { PermissionDeniedFallback } from "@/components/layout/permission-denied-fallback"
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
import { notify } from "@/lib/notify"
import {
  rolesReferenceSelectQueryOptions,
  taxOfficesReferenceSelectQueryOptions,
} from "@/lib/query/admin-reference-select-queries"
import type { ApiError } from "@/types/api"

function userToFormValues(user: UserDetail): UpdateUserFormValues {
  return {
    title: parseUserTitleFormValue(user.title),
    firstName: user.firstName,
    middleName: user.middleName ?? "",
    lastName: user.lastName,
    staffId: user.staffId ?? "",
    phone: user.phone ?? "",
    roleCode: user.role?.trim() ?? "",
    taxOfficeId: user.taxOfficeId ?? OPTIONAL_SELECT_NONE,
  }
}

function toUpdatePayload(values: UpdateUserFormValues): UpdateUserPayload {
  const payload: UpdateUserPayload = {
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

export type EditUserSheetProps = {
  userId: string
  user: UserDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  canUpdate: boolean
}

export function EditUserSheet({
  userId,
  user,
  open,
  onOpenChange,
  canUpdate,
}: EditUserSheetProps) {
  const { data: roles = [] } = useQuery(rolesReferenceSelectQueryOptions())
  const { data: taxOffices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const activeTaxOffices = taxOffices.filter((t) => t.isActive)

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: userToFormValues(user),
  })

  useEffect(() => {
    if (open) {
      form.reset(userToFormValues(user))
    }
  }, [open, user, form])

  const updateMutation = useUpdateUserMutation(userId)

  function onSubmit(values: UpdateUserFormValues) {
    updateMutation.mutate(toUpdatePayload(values), {
      onSuccess: (updated) => {
        form.reset(userToFormValues(updated))
        onOpenChange(false)
        notify.success("User updated.")
      },
      onError: (error: ApiError) => {
        notify.error(error.message)
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>
            Update profile and assignment. Email and username cannot be changed
            here.
          </SheetDescription>
        </SheetHeader>

        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Email</p>
          <p className="text-sm">{user.email}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Username
          </p>
          <p className="font-mono text-sm">{user.username}</p>
        </div>

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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!canUpdate}
                  >
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
                    disabled={!canUpdate}
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
                    disabled={!canUpdate}
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
                    disabled={!canUpdate}
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
                    disabled={!canUpdate}
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
                    disabled={!canUpdate}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="roleCode"
                label="Role"
                required
                render={({ field, fieldState }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!canUpdate}
                  >
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!canUpdate}
                  >
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
            </FieldGroup>

            {!canUpdate ? (
              <PermissionDeniedFallback
                variant="inline"
                accessVerb="update"
                resourceLabel="users"
                className="mt-4"
              />
            ) : null}
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-muted/30 sm:flex-row sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              disabled={!canUpdate || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
