import { z } from "zod"

import { REGION_TYPE_VALUES } from "@/features/regions/types"
import { OPTIONAL_SELECT_NONE } from "@/features/users/schemas"

const [typeFirst, ...typeRest] = REGION_TYPE_VALUES
const regionTypeSchema = z.enum([typeFirst, ...typeRest])

export const regionFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1, "Name is required").trim(),
  type: regionTypeSchema,
  parentId: z.union([
    z.literal(OPTIONAL_SELECT_NONE),
    z.string().min(1, "Select a parent region"),
  ]),
})

export type RegionFormValues = z.infer<typeof regionFormSchema>
export type RegionFormInputValues = z.input<typeof regionFormSchema>
