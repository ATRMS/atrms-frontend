import { fetchProfessionsList } from "@/features/professions/api/professions-api"
import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"

/** Active professions for {@link AsyncCommandSelect} (searchable list). */
export async function loadActiveProfessionsAsyncOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const trimmed = search.trim()
  const res = await fetchProfessionsList({
    page: 0,
    size: trimmed ? 50 : 500,
    isActive: true,
    ...(trimmed ? { search: trimmed } : {}),
  })

  return [...res.data]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.name}`,
    }))
}
