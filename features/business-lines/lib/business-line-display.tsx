"use client"

import { Badge } from "@/components/ui/badge"

export function BusinessLineStatusBadge({
  isActive,
}: {
  isActive: boolean
}) {
  return (
    <Badge variant={isActive ? "success" : "destructive"} className="font-normal">
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

export function BusinessLineSectorBadge({
  sector,
}: {
  sector: string | null | undefined
}) {
  const trimmed = sector?.trim()
  if (!trimmed) return <span className="text-muted-foreground">—</span>

  return (
    <Badge variant="secondary" className="max-w-56 truncate font-normal">
      {trimmed}
    </Badge>
  )
}
