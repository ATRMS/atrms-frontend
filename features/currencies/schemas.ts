import { z } from "zod"

export const currencyFormSchema = z.object({
  code: z
    .string()
    .min(3, "ISO code must be 3 letters")
    .max(3)
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1, "Name is required").trim(),
  symbol: z.string().min(1, "Symbol is required").trim(),
})

export type CurrencyFormValues = z.infer<typeof currencyFormSchema>
export type CurrencyFormInputValues = z.input<typeof currencyFormSchema>
