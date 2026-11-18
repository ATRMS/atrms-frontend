import { ResetPasswordPage } from "@/features/authentication/ui/reset-password.page"

export default async function ResetPasswordRoute({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; token?: string }>
}) {
  const { userId, token } = await searchParams
  return <ResetPasswordPage userId={userId} token={token} />
}
