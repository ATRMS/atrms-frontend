import { z } from "zod"

import { uuidSchema } from "@/lib/schemas/common"

function parseAmountString(raw: string): number {
  return Number(String(raw).replace(/,/g, "").trim())
}

export const revenueTargetFormSchema = z.object({
  taxTypeId: uuidSchema,
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  currencyId: uuidSchema,
  targetAmount: z
    .string()
    .min(1, "Enter target amount")
    .transform((s) => parseAmountString(s))
    .pipe(z.number().positive("Amount must be greater than zero")),
})

export type RevenueTargetFormValues = z.infer<typeof revenueTargetFormSchema>

/** RHF values before Zod transform (`z.coerce` input is `unknown` in Zod 4). */
export type RevenueTargetFormInputValues = {
  taxTypeId: string
  fiscalYear: number | ""
  currencyId: string
  targetAmount: string
}
