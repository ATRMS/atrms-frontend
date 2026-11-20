import { LoginPage } from "@/features/authentication/ui/login.page"
import { publicEnv } from "@/lib/config/env"
import { fetchPublicBrandingOnServer } from "@/features/authority-profile/api/public-branding"

export default async function LoginRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const branding = await fetchPublicBrandingOnServer()
  return (
    <LoginPage appName={publicEnv.appName} next={next} branding={branding} />
  )
}
