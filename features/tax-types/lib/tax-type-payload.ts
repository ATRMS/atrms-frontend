import type { TaxTypeFormValues } from "@/features/tax-types/schemas"
import type { TaxTypeWritePayload } from "@/features/tax-types/types"

export function toTaxTypeWritePayload(
  values: TaxTypeFormValues
): TaxTypeWritePayload {
  const base: TaxTypeWritePayload = {
    code: values.code,
    name: values.name,
    category: values.category,
    rateType: values.rateType,
    collectingAuthority: values.collectingAuthority,
  }

  if (values.rateType === "PERCENTAGE" || values.rateType === "FIXED") {
    return { ...base, defaultRate: values.defaultRate as number }
  }

  return base
}
