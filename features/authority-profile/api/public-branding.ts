import "server-only"

import { apiPaths } from "@/lib/api/endpoints"
import { unwrapApiPayload } from "@/lib/api/envelope"
import { assertServerApiBaseUrl } from "@/lib/config/env"
import type { PublicBranding } from "@/features/authority-profile/types"
import type { ApiResponse } from "@/types/api"

export async function fetchPublicBrandingOnServer(): Promise<PublicBranding | null> {
  try {
    const response = await fetch(
      `${assertServerApiBaseUrl()}${apiPaths.public.branding}`,
      { cache: "no-store" }
    )
    if (!response.ok) return null
    return unwrapApiPayload(
      (await response.json()) as ApiResponse<PublicBranding>
    )
  } catch {
    return null
  }
}
