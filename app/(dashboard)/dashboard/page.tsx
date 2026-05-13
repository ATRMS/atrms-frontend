import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Revenue Collected", value: "NGN 0.00" },
  { label: "Open Assessments", value: "0" },
  { label: "Active Offices", value: "0" },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor revenue operations and administration activity."
        action={<Button variant="outline">Export</Button>}
      />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <section
            key={metric.label}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {metric.value}
            </p>
          </section>
        ))}
      </div>
      <section className="min-h-96 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="text-base font-medium">Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue activity and operational summaries will appear here.
        </p>
      </section>
    </>
  )
}
