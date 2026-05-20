import { fetchBusinessLinesList } from "@/features/business-lines/api/business-lines-api"
import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"

/** Active business lines for {@link AsyncCommandSelect} (searchable list). */
export async function loadActiveBusinessLinesAsyncOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const trimmed = search.trim()
  const res = await fetchBusinessLinesList({
    page: 0,
    size: trimmed ? 50 : 500,
    isActive: true,
    ...(trimmed ? { search: trimmed } : {}),
  })

  return [...res.data]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((bl) => ({
      value: bl.id,
      label: `${bl.code} — ${bl.name}`,
    }))
}
