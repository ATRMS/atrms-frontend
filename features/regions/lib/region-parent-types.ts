import type { RegionType } from "@/features/regions/types"

/**
 * Non-state subdivisions attach under a state-level region.
 * Backend may enforce further rules.
 */
export function eligibleRegionParentTypes(
  childType: RegionType
): RegionType[] | null {
  if (childType === "STATE") return null
  return ["STATE"]
}

export function regionShowsParentField(type: RegionType): boolean {
  return eligibleRegionParentTypes(type) !== null
}

export function isEligibleRegionParent(
  childType: RegionType,
  candidateType: RegionType
): boolean {
  const allowed = eligibleRegionParentTypes(childType)
  if (!allowed) return false
  return allowed.includes(candidateType)
}
