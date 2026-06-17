import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  SystemSettings,
  UpdateSystemSettingsPayload,
} from "@/features/system-settings/types"
import type { ApiResponse } from "@/types/api"

export async function fetchSystemSettings(): Promise<SystemSettings> {
  const res = await apiClient.get<ApiResponse<SystemSettings>>(
    apiPaths.system.settings
  )
  return unwrapApiPayload(res.data)
}

export async function updateSystemSettings(
  payload: UpdateSystemSettingsPayload
): Promise<SystemSettings> {
  const res = await apiClient.put<ApiResponse<SystemSettings>>(
    apiPaths.system.settings,
    payload
  )
  return unwrapApiPayload(res.data)
}

export async function testMailConfiguration(): Promise<void> {
  await apiClient.post(apiPaths.system.testMail)
}

export async function testSmsConfiguration(): Promise<void> {
  await apiClient.post(apiPaths.system.testSms)
}
