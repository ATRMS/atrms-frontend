import { z } from "zod"

import { uuidSchema } from "@/lib/schemas/common"

export const bankAccountCreateSchema = z.object({
  accountNumber: z.string().min(1, "Required").trim(),
  accountName: z.string().min(1, "Required").trim(),
  bankName: z.string().min(1, "Required").trim(),
  bankCode: z.string().min(1, "Required").trim(),
  taxTypeId: uuidSchema,
  currencyId: uuidSchema,
})

export type BankAccountCreateFormValues = z.infer<
  typeof bankAccountCreateSchema
>

export const bankAccountUpdateSchema = z.object({
  accountNumber: z.string().min(1, "Required").trim(),
  accountName: z.string().min(1, "Required").trim(),
  bankName: z.string().min(1, "Required").trim(),
  bankCode: z.string().min(1, "Required").trim(),
})

export type BankAccountUpdateFormValues = z.infer<
  typeof bankAccountUpdateSchema
>
