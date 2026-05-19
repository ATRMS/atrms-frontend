"use client"

import { Badge } from "@/components/ui/badge"

export function OrganizationStatusBadge({
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
