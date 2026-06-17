"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchSystemSettings } from "@/features/system-settings/api/system-settings-api"
import { queryKeys } from "@/lib/query-keys"

export function useSystemSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.system.settings(),
    queryFn: fetchSystemSettings,
  })
}
