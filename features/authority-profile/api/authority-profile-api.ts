import { apiClient } from "@/lib/api/client"
import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import type {
  AuthorityProfile,
  BrandingAsset,
  PublicBranding,
} from "@/features/authority-profile/types"
import type { ApiResponse } from "@/types/api"

export async function fetchAuthorityProfile(): Promise<AuthorityProfile> {
  return unwrapApiPayload(
    (
      await apiClient.get<ApiResponse<AuthorityProfile>>(
        apiPaths.masterData.authorityProfile
      )
    ).data
  )
}
export async function updateAuthorityProfile(
  profile: AuthorityProfile
): Promise<AuthorityProfile> {
  return unwrapApiPayload(
    (
      await apiClient.put<ApiResponse<AuthorityProfile>>(
        apiPaths.masterData.authorityProfile,
        profile
      )
    ).data
  )
}
export async function uploadBranding(
  asset: BrandingAsset,
  file: File
): Promise<void> {
  const body = new FormData()
  body.append("file", file)
  await apiClient.put(apiPaths.masterData.authorityBranding(asset), body, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}
export async function fetchPublicBranding(): Promise<PublicBranding> {
  return unwrapApiPayload(
    (await apiClient.get<ApiResponse<PublicBranding>>(apiPaths.public.branding))
      .data
  )
}
