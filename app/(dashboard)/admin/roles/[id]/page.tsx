import { RoleDetailPage } from "@/features/roles/ui/role-detail.page"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminRoleDetailRoutePage({ params }: PageProps) {
  const { id } = await params

  return <RoleDetailPage roleId={id} />
}
