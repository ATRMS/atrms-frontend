import type { TaxOfficeFormValues } from "@/features/tax-offices/schemas"
import type { TaxOfficeWritePayload } from "@/features/tax-offices/types"

export function toTaxOfficeWritePayload(
  values: TaxOfficeFormValues
): TaxOfficeWritePayload {
  return {
    code: values.code,
    name: values.name,
    regionId: values.regionId,
    address: values.address,
    phone: values.phone.trim(),
    email: values.email.trim(),
  }
}
