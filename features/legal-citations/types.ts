import type { VersionStatus } from "@/features/workflow/types"
export interface CitationVersion {
  code: string
  version: number
  title: string
  citationText: string
  jurisdiction: "NATIONAL" | "STATE"
  law: string
  section: string | null
  documentTypes: string[]
  effectiveFrom: string
  effectiveTo: string | null
  sourceReference: string | null
  status: VersionStatus
  proposedBy: string | null
  instanceId: string | null
}
export interface Citation {
  code: string
  active: boolean
  inForce: CitationVersion | null
}
export type CitationPayload = Omit<
  CitationVersion,
  "version" | "effectiveTo" | "status" | "proposedBy" | "instanceId"
> & { sourceReference?: string | null }
