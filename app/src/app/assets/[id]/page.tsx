import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import AssetTrendChart from "./AssetTrendChart";

export const dynamic = "force-dynamic";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      department: true,
      alerts: { orderBy: { createdAt: "desc" }, take: 5 },
      workOrders: { orderBy: { createdAt: "desc" }, take: 5 },
      reports: {
        include: { reporter: { select: { name: true } } },
        orderBy: { reportedAt: "desc" },
      },
    },
  });
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const asset = await getAsset(id);

  if (!asset) notFound();

  const trendData = [...asset.reports]
    .reverse()
    .map((report) => ({
      label: new Date(report.reportedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: report.score,
    }));

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <Link href="/assets" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
            Back to assets
          </Link>
        </div>

        <section className="hero-panel mb-8 grid gap-6 p-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-mono text-muted-foreground">
                {asset.assetCode}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {asset.assetType.replace("_", " ")}
              </span>
            </div>
            <h1 className="font-heading text-5xl font-semibold tracking-[-0.06em] text-foreground">{asset.name}</h1>
            <p className="mt-4 flex items-start gap-2 text-lg leading-8 text-muted-foreground">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              {asset.address}, {asset.districtCode}, {asset.stateCode}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/assets/${asset.id}/report`}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Submit new report
              </Link>
              <Link
                href="/reports"
                className="rounded-full border border-border/70 bg-background/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30"
              >
                Open report feed
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Current score</div>
              <div className="mt-3 font-heading text-5xl font-semibold tracking-[-0.06em]" style={{ color: getScoreColor(asset.currentScore ?? -1) }}>
                {asset.currentScore?.toFixed(1) ?? "-"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {typeof asset.currentScore === "number" ? getScoreLabel(asset.currentScore) : "No score recorded"}
              </div>
            </div>
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Department</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{asset.department?.name || "N/A"}</div>
              <div className="mt-2 text-sm text-muted-foreground">Status: {asset.status.replace("_", " ")}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <AssetTrendChart data={trendData} />

            <div className="surface-card p-6">
              <div className="mb-5">
                <div className="section-kicker">Report History</div>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Inspection timeline
                </h2>
              </div>
              <div className="space-y-4">
                {asset.reports.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold" style={{ color: getScoreColor(report.score) }}>
                            {report.score.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">{getScoreLabel(report.score)}</span>
                        </div>
                        {report.notes ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{report.notes}</div> : null}
                        <div className="mt-2 text-xs text-muted-foreground">
                          By {report.reporter?.name || "Unknown"} on {new Date(report.reportedAt).toLocaleString()}
                        </div>
                      </div>
                      {report.previousScore !== null ? (
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Previous {report.previousScore.toFixed(1)}</div>
                          <div className={report.scoreDelta && report.scoreDelta < 0 ? "text-[var(--color-critical)]" : "text-[var(--color-safe)]"}>
                            {report.scoreDelta && report.scoreDelta > 0 ? "+" : ""}
                            {report.scoreDelta?.toFixed(1) ?? "0.0"}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {asset.reports.length === 0 ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No reports yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card p-6">
              <div className="section-kicker">Alerts</div>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">Recent warnings</h2>
              <div className="mt-5 space-y-3">
                {asset.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-critical)]">{alert.severity}</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{alert.message}</div>
                  </div>
                ))}
                {asset.alerts.length === 0 ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No alerts for this asset.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="section-kicker">Work Orders</div>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">Maintenance trail</h2>
              <div className="mt-5 space-y-3">
                {asset.workOrders.map((workOrder) => (
                  <div key={workOrder.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-signal)]">
                        {workOrder.priority}
                      </div>
                      <div className="text-xs text-muted-foreground">{workOrder.status}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{workOrder.reason}</div>
                  </div>
                ))}
                {asset.workOrders.length === 0 ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No work orders created yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
