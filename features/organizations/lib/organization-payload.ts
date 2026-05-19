import type {
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
} from "@/features/organizations/types"
import type { OrganizationFormValues } from "@/features/organizations/schemas"

export function toOrganizationCreatePayload(
  values: OrganizationFormValues
): OrganizationCreatePayload {
  const payload: OrganizationCreatePayload = {
    name: values.name,
    taxOfficeId: values.taxOfficeId,
    businessLineId: values.businessLineId,
    address: values.address,
    phone: values.phone,
    email: values.email,
  }

  const reg = values.regNumber?.trim()
  if (reg) payload.regNumber = reg

  const web = values.website?.trim()
  if (web) payload.website = web

  return payload
}

export function toOrganizationUpdatePayload(
  values: OrganizationFormValues
): OrganizationUpdatePayload {
  return {
    name: values.name,
    regNumber: values.regNumber?.trim() ? values.regNumber.trim() : null,
    taxOfficeId: values.taxOfficeId,
    businessLineId: values.businessLineId,
    address: values.address,
    phone: values.phone,
    email: values.email,
    website: values.website?.trim() ? values.website.trim() : null,
  }
}
