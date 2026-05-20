import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{ tin?: string }>
}

/** Legacy URL — epic opens registration from `/individuals?tin=`. */
export default async function AdminRegisterIndividualRedirectPage({
  searchParams,
}: PageProps) {
  const { tin } = await searchParams

  if (tin?.trim()) {
    redirect(
      `/admin/taxpayers/individuals?tin=${encodeURIComponent(tin.trim())}`
    )
  }

  redirect("/admin/taxpayers/individuals")
}
