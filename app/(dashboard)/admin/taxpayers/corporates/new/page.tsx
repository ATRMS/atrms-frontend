import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{ tin?: string }>
}

/** Legacy URL — epic opens registration from `/corporates?tin=`. */
export default async function AdminRegisterCorporateRedirectPage({
  searchParams,
}: PageProps) {
  const { tin } = await searchParams

  if (tin?.trim()) {
    redirect(
      `/admin/taxpayers/corporates?tin=${encodeURIComponent(tin.trim())}`
    )
  }

  redirect("/admin/taxpayers/corporates")
}
