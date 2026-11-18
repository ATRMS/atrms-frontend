import type { VersionStatus } from "@/features/workflow/types"
export type ValueType =
  | "AMOUNT"
  | "RATE"
  | "DAYS"
  | "DAY_OF_MONTH"
  | "DAY_OF_YEAR"
  | "BANDS"
export type Band = { upTo: string | null; rate: string }
export type ParameterValue = string | number | Band[]
export interface ParameterVersion {
  code: string
  version: number
  value: ParameterValue
  effectiveFrom: string
  effectiveTo: string | null
  sourceReference: string | null
  status: VersionStatus
  proposedBy: string | null
  instanceId: string | null
}
export interface Parameter {
  code: string
  name: string
  description: string
  valueType: ValueType
  requiredFor: string[]
  inForce: ParameterVersion | null
}
