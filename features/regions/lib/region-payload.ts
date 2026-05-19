import { OPTIONAL_SELECT_NONE } from "@/features/users/schemas"
import type { RegionFormValues } from "@/features/regions/schemas"
import { regionShowsParentField } from "@/features/regions/lib/region-parent-types"
import type { RegionWritePayload } from "@/features/regions/types"

export function toRegionWritePayload(values: RegionFormValues): RegionWritePayload {
  const base: RegionWritePayload = {
    code: values.code,
    name: values.name,
    type: values.type,
  }

  if (
    regionShowsParentField(values.type) &&
    values.parentId !== OPTIONAL_SELECT_NONE &&
    values.parentId.trim()
  ) {
    return { ...base, parentId: values.parentId.trim() }
  }

  return base
}
