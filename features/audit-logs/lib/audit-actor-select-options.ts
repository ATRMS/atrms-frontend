import { fetchUsersList } from "@/features/users/api/users-api"
import type { AsyncCommandSelectOption } from "@/components/shared/async-command-select"

export async function loadAuditActorSelectOptions(
  search: string
): Promise<AsyncCommandSelectOption[]> {
  const res = await fetchUsersList({
    search: search.trim() || undefined,
    page: 1,
    size: 25,
  })

  return res.data.map((user) => {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    return {
      value: user.id,
      label: `${name} (${user.email})`,
    }
  })
}
