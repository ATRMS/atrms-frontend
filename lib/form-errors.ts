import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form"

import type { ApiError } from "@/types/api"

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>,
  keyToField: Partial<Record<string, FieldPath<TFieldValues>>> = {}
): boolean {
  let applied = false

  for (const fieldError of error.fieldErrors ?? []) {
    setError(fieldError.field as FieldPath<TFieldValues>, {
      message: fieldError.message,
      type: "server",
    })
    applied = true
  }

  const field = error.messageKey ? keyToField[error.messageKey] : undefined

  if (field) {
    setError(field, { message: error.message, type: "server" })
    applied = true
  }

  return applied
}
