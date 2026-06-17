import { z } from "zod"

export const systemSettingsFormSchema = z.object({
  taxAuthorityId: z.string().trim().max(64),
  taxAuthorityName: z.string().trim().max(255),
  sessionTimeoutMinutes: z
    .union([z.literal(""), z.number().int().min(5).max(480)])
    .refine((v) => v !== "", "Session timeout is required"),
  failedLoginAttempts: z
    .union([z.literal(""), z.number().int().min(3).max(10)])
    .refine((v) => v !== "", "Failed login attempts is required"),
  passwordExpirationDays: z
    .union([z.literal(""), z.number().int().min(0)])
    .refine((v) => v !== "", "Password expiration is required"),
  mailServer: z.string().trim().max(255),
  mailSender: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.email().safeParse(v).success,
      "Enter a valid email"
    ),
  mailUser: z.string().trim().max(255),
  mailPassword: z.string(),
  smsGatewayUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.url().safeParse(v).success,
      "Enter a valid URL"
    ),
  smsApiKey: z.string(),
})

export type SystemSettingsFormValues = z.infer<typeof systemSettingsFormSchema>

/** RHF values before Zod coercion (`z.coerce` input is `unknown` in Zod 4). */
export type SystemSettingsFormInputValues = {
  taxAuthorityId: string
  taxAuthorityName: string
  sessionTimeoutMinutes: number | ""
  failedLoginAttempts: number | ""
  passwordExpirationDays: number | ""
  mailServer: string
  mailSender: string
  mailUser: string
  mailPassword: string
  smsGatewayUrl: string
  smsApiKey: string
}
