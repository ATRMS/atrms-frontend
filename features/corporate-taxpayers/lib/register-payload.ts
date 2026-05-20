import type { RegisterCorporatePayload } from "@/features/corporate-taxpayers/types"
import type { RegisterCorporateFormValues } from "@/features/corporate-taxpayers/schemas"
import { parseAnnualIncomeToNumber } from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"

export function toRegisterCorporatePayload(
  values: RegisterCorporateFormValues
): RegisterCorporatePayload {
  const ecRaw = values.employeeCount?.trim() ?? ""
  const payload: RegisterCorporatePayload = {
    tin: values.tin.trim(),
    taxOfficeId: values.taxOfficeId,
    companyName: values.companyName.trim(),
    regNumber: values.regNumber.trim(),
    dateOfIncorporation: values.dateOfIncorporation.trim(),
    companyType: values.companyType,
    businessLineId: values.businessLineId,
    phone: values.phone.trim(),
    email: values.email.trim(),
    registeredAddress: values.registeredAddress.trim(),
    operatingAddress: values.operatingAddress.trim(),
    annualTurnover: parseAnnualIncomeToNumber(values.annualTurnover),
  }

  if (ecRaw !== "") {
    payload.employeeCount = Number.parseInt(ecRaw, 10)
  }

  return payload
}
