export type SystemSettings = {
  id: string
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
