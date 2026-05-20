import { fetchOrganizationsList } from "@/features/organizations/api/organizations-api"
import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"

/** Active organizations for employer {@link AsyncCommandSelect} (searchable list). */
export async function loadActiveOrganizationsAsyncOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const trimmed = search.trim()
  const res = await fetchOrganizationsList({
    page: 0,
    size: trimmed ? 50 : 500,
    isActive: true,
    ...(trimmed ? { search: trimmed } : {}),
  })

  return [...res.data]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => ({
      value: o.id,
      label: `${o.regNumber ? `${o.regNumber} — ` : ""}${o.name}${o.isActive ? "" : " (Inactive)"}`,
    }))
}
