import { z } from "zod"

const taxpayerTypeSchema = z.enum(["INDIVIDUAL", "CORPORATE"])

export const tinRequestCreateFormSchema = z.object({
  taxpayerType: taxpayerTypeSchema,
  requesterRef: z.string().trim().optional(),
})

export type TinRequestCreateFormValues = z.infer<
  typeof tinRequestCreateFormSchema
>

export const tinRequestRejectFormSchema = z.object({
  reason: z.string().min(1, "Reason is required").trim(),
})

export type TinRequestRejectFormValues = z.infer<
  typeof tinRequestRejectFormSchema
>
