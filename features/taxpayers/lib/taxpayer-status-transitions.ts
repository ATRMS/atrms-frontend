import type { TaxpayerStatus } from "@/features/individual-taxpayers/types"

const ALLOWED_TRANSITIONS: Record<TaxpayerStatus, readonly TaxpayerStatus[]> = {
  ACTIVE: ["INACTIVE", "BLACKLISTED", "DECEASED"],
  INACTIVE: ["ACTIVE", "BLACKLISTED"],
  BLACKLISTED: [],
  DECEASED: [],
}

export function getAllowedTaxpayerStatusTransitions(
  current: TaxpayerStatus
): TaxpayerStatus[] {
  return [...ALLOWED_TRANSITIONS[current]]
}

export function taxpayerStatusChangeRequiresReason(
  target: TaxpayerStatus
): boolean {
  return target === "BLACKLISTED" || target === "DECEASED"
}
