import { LoginPage } from "@/features/authentication/ui/login.page"
import { publicEnv } from "@/lib/config/env"

export default function LoginRoutePage() {
  return <LoginPage appName={publicEnv.appName} />
}
