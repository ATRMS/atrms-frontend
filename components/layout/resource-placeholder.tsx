import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"

export function ResourcePlaceholder({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={<Button>Add {title}</Button>}
      />
      <section className="min-h-96 rounded-lg border bg-card p-4 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          {title} management will be implemented in the administration epic.
        </p>
      </section>
    </>
  )
}
