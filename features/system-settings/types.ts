export type SystemSettings = {
  id: string
  taxAuthorityId: string | null
  taxAuthorityName: string | null
  sessionTimeoutMinutes: number
  failedLoginAttempts: number
  passwordExpirationDays: number
  mailServer: string | null
  mailSender: string | null
  mailUser: string | null
  smsGatewayUrl: string | null
  updatedBy: string | null
}

export type UpdateSystemSettingsPayload = {
  taxAuthorityId?: string | null
  taxAuthorityName?: string | null
  sessionTimeoutMinutes: number
  failedLoginAttempts: number
  passwordExpirationDays: number
  mailServer?: string | null
  mailSender?: string | null
  mailUser?: string | null
  mailPassword?: string
  smsGatewayUrl?: string | null
  smsApiKey?: string
}
