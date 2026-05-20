"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { taxOfficesActiveReferenceQueryOptions } from "@/lib/query/admin-reference-select-queries"

/** Resolves a tax office id to `code — name` using the active tax-office reference query. */
export function TaxOfficeLookup({
  taxOfficeId,
}: {
  taxOfficeId: string
}) {
  const { data: offices = [] } = useQuery(
    taxOfficesActiveReferenceQueryOptions()
  )

  const label = useMemo(() => {
    const o = offices.find((x) => x.id === taxOfficeId)
    if (o) return `${o.code} — ${o.name}`
    return taxOfficeId
  }, [taxOfficeId, offices])

  const resolved = offices.some((x) => x.id === taxOfficeId)

  if (resolved) {
    return <span>{label}</span>
  }

  return (
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
  )
}
