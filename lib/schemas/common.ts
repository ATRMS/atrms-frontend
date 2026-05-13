import { z } from "zod"

export const uuidSchema = z.string().uuid()
export const phoneSchema = z.string().regex(/^\+?[0-9]{10,14}$/, {
  message: "Enter a valid phone number",
})
export const emailSchema = z.string().email()
export const yearSchema = z.number().int().min(2020).max(2099)
export const amountSchema = z.number().positive()
