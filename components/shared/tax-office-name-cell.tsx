"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { taxOfficesReferenceSelectQueryOptions } from "@/lib/query/admin-reference-select-queries"

export function TaxOfficeNameCell({ taxOfficeId }: { taxOfficeId: string }) {
  const { data: offices = [] } = useQuery(
    taxOfficesReferenceSelectQueryOptions()
  )

  const label = useMemo(() => {
    const o = offices.find((x) => x.id === taxOfficeId)
    if (o) return `${o.code} — ${o.name}`
    return taxOfficeId
  }, [taxOfficeId, offices])

  const resolved = offices.some((x) => x.id === taxOfficeId)

  if (resolved) {
    return <span className="text-sm">{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}
