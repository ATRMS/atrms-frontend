import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from "react-hook-form"

import type { ApiError } from "@/types/api"

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>
) {
  Object.entries(error.fieldErrors ?? {}).forEach(([field, messages]) => {
    setError(field as FieldPath<TFieldValues>, {
      message: messages.join(", "),
      type: "server",
    })
  })
}
