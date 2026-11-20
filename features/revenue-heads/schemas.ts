import { z } from "zod"
import { uuidSchema } from "@/lib/schemas/common"
export const revenueHeadSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Name is required"),
  taxTypeId: uuidSchema,
  stateAgencyId: uuidSchema,
  subCategory: z.string().trim().optional(),
})
export type RevenueHeadInput = z.input<typeof revenueHeadSchema>
export type RevenueHeadValues = z.infer<typeof revenueHeadSchema>
const decimal = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "Enter a decimal value")
export const rateSchema = z
  .object({
    rateKind: z.enum(["RATE", "FIXED_AMOUNT", "RATE_TABLE"]),
    value: z.string().min(1, "Value is required"),
    effectiveFrom: z.string().date("Choose an effective date"),
    sourceReference: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.rateKind !== "RATE_TABLE" &&
      !decimal.safeParse(data.value).success
    )
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Enter a decimal value",
      })
    if (
      data.effectiveFrom < new Date().toISOString().slice(0, 10) &&
      !data.sourceReference
    )
      ctx.addIssue({
        code: "custom",
        path: ["sourceReference"],
        message: "Source is required for a past date",
      })
    if (
      data.rateKind === "RATE" &&
      (Number(data.value) < 0 || Number(data.value) > 100)
    )
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Enter a percentage from 0 to 100",
      })
    if (data.rateKind === "RATE_TABLE") {
      try {
        JSON.parse(data.value)
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "Enter a valid JSON rate table",
        })
      }
    }
  })
export type RateInput = z.infer<typeof rateSchema>
