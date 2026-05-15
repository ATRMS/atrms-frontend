import { UserDetailPage } from "@/features/users/ui/user-detail.page"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params

  return <UserDetailPage userId={id} />
}
