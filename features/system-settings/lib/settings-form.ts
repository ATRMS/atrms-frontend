import type { SystemSettings } from "@/features/system-settings/types"
import type {
  SystemSettingsFormInputValues,
  SystemSettingsFormValues,
} from "@/features/system-settings/schemas"
import type { UpdateSystemSettingsPayload } from "@/features/system-settings/types"

export const SECRET_FIELD_PLACEHOLDER = "••••••••"

export function systemSettingsToFormValues(
  data: SystemSettings
): SystemSettingsFormInputValues {
  return {
    taxAuthorityId: data.taxAuthorityId ?? "",
    taxAuthorityName: data.taxAuthorityName ?? "",
    sessionTimeoutMinutes: data.sessionTimeoutMinutes,
    failedLoginAttempts: data.failedLoginAttempts,
    passwordExpirationDays: data.passwordExpirationDays,
    mailServer: data.mailServer ?? "",
    mailSender: data.mailSender ?? "",
    mailUser: data.mailUser ?? "",
    mailPassword: "",
    smsGatewayUrl: data.smsGatewayUrl ?? "",
    smsApiKey: "",
  }
}

export function mailCredentialsConfigured(data: SystemSettings): boolean {
  return Boolean(data.mailServer?.trim() && data.mailUser?.trim())
}

export function smsCredentialsConfigured(data: SystemSettings): boolean {
  return Boolean(data.smsGatewayUrl?.trim())
}

export function formValuesToUpdatePayload(
  values: SystemSettingsFormValues,
  options: {
    hadMailPassword: boolean
    hadSmsApiKey: boolean
  }
): UpdateSystemSettingsPayload {
  const payload: UpdateSystemSettingsPayload = {
    taxAuthorityId: values.taxAuthorityId.trim() || null,
    taxAuthorityName: values.taxAuthorityName.trim() || null,
    sessionTimeoutMinutes: values.sessionTimeoutMinutes,
    failedLoginAttempts: values.failedLoginAttempts,
    passwordExpirationDays: values.passwordExpirationDays,
    mailServer: values.mailServer.trim() || null,
    mailSender: values.mailSender.trim() || null,
    mailUser: values.mailUser.trim() || null,
    smsGatewayUrl: values.smsGatewayUrl.trim() || null,
  }

  const mailPassword = values.mailPassword.trim()
  if (mailPassword) {
    payload.mailPassword = mailPassword
  } else if (!options.hadMailPassword) {
    payload.mailPassword = ""
  }

  const smsApiKey = values.smsApiKey.trim()
  if (smsApiKey) {
    payload.smsApiKey = smsApiKey
  } else if (!options.hadSmsApiKey) {
    payload.smsApiKey = ""
  }

  return payload
}
