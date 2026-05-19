import { z } from "zod"

import {
  TAX_TYPE_CATEGORY_VALUES,
  TAX_TYPE_COLLECTING_AUTHORITY_VALUES,
  TAX_TYPE_RATE_TYPE_VALUES,
} from "@/features/tax-types/types"

const [catFirst, ...catRest] = TAX_TYPE_CATEGORY_VALUES
const categorySchema = z.enum([catFirst, ...catRest])

const [rateFirst, ...rateRest] = TAX_TYPE_RATE_TYPE_VALUES
const rateTypeSchema = z.enum([rateFirst, ...rateRest])

const [authFirst, ...authRest] = TAX_TYPE_COLLECTING_AUTHORITY_VALUES
const collectingAuthoritySchema = z.enum([authFirst, ...authRest])

export const taxTypeFormSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .transform((s) => s.trim().toUpperCase()),
    name: z.string().min(1, "Name is required").trim(),
    category: categorySchema,
    rateType: rateTypeSchema,
    defaultRate: z.number().optional(),
    collectingAuthority: collectingAuthoritySchema,
  })
  .superRefine((data, ctx) => {
    if (data.rateType === "PERCENTAGE" || data.rateType === "FIXED") {
      if (
        data.defaultRate === undefined ||
        Number.isNaN(data.defaultRate) ||
        !Number.isFinite(data.defaultRate)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Default rate is required for this rate type",
          path: ["defaultRate"],
        })
      }
    }
  })

export type TaxTypeFormValues = z.infer<typeof taxTypeFormSchema>

export type TaxTypeFormInputValues = z.input<typeof taxTypeFormSchema>
