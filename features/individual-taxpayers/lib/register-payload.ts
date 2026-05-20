import type { RegisterIndividualPayload } from "@/features/individual-taxpayers/types"
import type { RegisterIndividualFormValues } from "@/features/individual-taxpayers/schemas"

export function toRegisterIndividualPayload(
  values: RegisterIndividualFormValues
): RegisterIndividualPayload {
  const payload: RegisterIndividualPayload = {
    tin: values.tin.trim(),
    taxOfficeId: values.taxOfficeId,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dateOfBirth: values.dateOfBirth.trim(),
    gender: values.gender,
    maritalStatus: values.maritalStatus,
    nationality: values.nationality.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    lgaOfOrigin: values.lgaOfOrigin.trim(),
    stateOfOrigin: values.stateOfOrigin.trim(),
    annualIncome: Number(values.annualIncome),
  }

  const middle = values.middleName?.trim()
  if (middle) {
    payload.middleName = middle
  }

  const nin = values.nin?.trim()
  if (nin) {
    payload.nin = nin
  }

  const bvn = values.bvn?.trim()
  if (bvn) {
    payload.bvn = bvn
  }

  const professionId = values.professionId?.trim()
  if (professionId) {
    payload.professionId = professionId
  }

  const employerId = values.employerId?.trim()
  if (employerId) {
    payload.employerId = employerId
  }

  return payload
}
