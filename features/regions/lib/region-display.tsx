"use client"

import type { RegionType } from "@/features/regions/types"
import { Badge } from "@/components/ui/badge"

export const REGION_TYPE_LABELS: Record<RegionType, string> = {
  STATE: "State",
  LGA: "LGA",
  SENATORIAL: "Senatorial",
  FEDERAL_CONSTITUENCY: "Federal constituency",
}

export function RegionTypeBadge({ type }: { type: RegionType }) {
  return (
    <Badge variant="outline" className="font-normal">
      {REGION_TYPE_LABELS[type]}
    </Badge>
  )
}