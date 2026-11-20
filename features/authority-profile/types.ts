export interface AuthorityProfile {
  name: string
  shortName: string | null
  authorityCode: string
  stateCode: string
  address: string
  headName: string
  headTitle: string
  phone: string | null
  email: string
  website: string | null
}
export type BrandingAsset = "logo" | "banner" | "emblem" | "signature"
export interface BrandingImage {
  url: string
  contentType: string
  expiresAt: string
}
export interface PublicBranding {
  name: string
  shortName: string | null
  logo: BrandingImage | null
  banner: BrandingImage | null
}
