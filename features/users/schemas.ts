import { z } from "zod"

import { USER_TITLE_VALUES } from "@/features/users/types"
import { emailSchema } from "@/lib/schemas/common"

/**
 * Radix Select forbids `SelectItem value=""` (empty string is reserved for clearing).
 * Use this value for “None” options on optional selects.
 */
export const OPTIONAL_SELECT_NONE = "__none__" as const

const [firstTitle, ...otherTitles] = USER_TITLE_VALUES
export const userTitleSchema = z.enum([firstTitle, ...otherTitles])

export type UserTitleFormEnum = z.infer<typeof userTitleSchema>

export function parseUserTitleFormValue(
  value: string | null | undefined
): UserTitleFormEnum | typeof OPTIONAL_SELECT_NONE {
  const parsed = userTitleSchema.safeParse(value ?? "")

  return parsed.success ? parsed.data : OPTIONAL_SELECT_NONE
}

export const createUserFormSchema = z.object({
  title: z.union([userTitleSchema, z.literal(OPTIONAL_SELECT_NONE)]),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  staffId: z.string(),
  email: emailSchema,
  username: z.string().trim().optional(),
  phone: z.string(),
  roleCode: z.string().trim().min(1, "Role is required"),
  taxOfficeId: z.string(),
})

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>

export const updateUserFormSchema = createUserFormSchema.omit({
  email: true,
  username: true,
})

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>

export const transferUserFormSchema = z.object({
  toTaxOfficeId: z.string().trim().min(1, "Select a tax office"),
  reason: z.string().trim().min(1, "Reason is required"),
  effectiveDate: z.string().trim().min(1, "Effective date is required"),
})

export type TransferUserFormValues = z.infer<typeof transferUserFormSchema>
