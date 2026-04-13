import Link from "next/link";
import { AlertSeverity } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAlerts() {
  return prisma.alert.findMany({
    include: {
      asset: true,
      report: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  const severityColors: Record<AlertSeverity, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <section className="hero-panel mb-8 p-8">
          <div className="section-kicker">Alert Feed</div>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-foreground">
            Monitor threshold breaches and degradation warnings.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Alerts are generated directly from report score transitions, so this screen shows whether the scoring logic
            is producing the right maintenance signals.
          </p>
        </section>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="surface-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/assets/${alert.assetId}`} className="font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground transition hover:text-primary">
                    {alert.asset.name}
                  </Link>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{alert.message}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${severityColors[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${alert.isAcknowledged ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {alert.isAcknowledged ? "Acknowledged" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {alert.alertType.replace("_", " ")} · {new Date(alert.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {alerts.length === 0 ? (
            <div className="surface-card px-6 py-10 text-center text-sm text-muted-foreground">No alerts found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
