import { z } from "zod"

const templateCodeRegex = /^[A-Z][A-Z0-9_]*$/

export const createNotificationTemplateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(64)
      .regex(
        templateCodeRegex,
        "Use uppercase letters, numbers, and underscores (e.g. WELCOME_USER)"
      ),
    channel: z.enum(["SMS", "EMAIL"]),
    subject: z.string().trim().max(255),
    body: z.string().trim().min(1, "Body is required"),
    availableVariables: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "EMAIL" && !data.subject.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subject is required for email templates",
        path: ["subject"],
      })
    }
  })

export type CreateNotificationTemplateFormValues = z.infer<
  typeof createNotificationTemplateSchema
>

export const editNotificationTemplateSchema = z
  .object({
    subject: z.string().trim().max(255),
    body: z.string().trim().min(1, "Body is required"),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // channel validated at submit time from template row
    void data
    void ctx
  })

export type EditNotificationTemplateFormValues = z.infer<
  typeof editNotificationTemplateSchema
>
