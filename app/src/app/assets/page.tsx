import Link from "next/link";
import { ArrowRight, MapPin, ShieldAlert, Wrench } from "lucide-react";
import { prisma } from "@/lib/db";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

async function getAssets() {
  return prisma.asset.findMany({
    include: { department: true, alerts: { where: { isAcknowledged: false } }, workOrders: true },
    orderBy: [{ currentScore: "asc" }, { createdAt: "desc" }],
  });
}

export default async function AssetsPage() {
  const assets = await getAssets();
  const riskyAssets = assets.filter((asset) => typeof asset.currentScore === "number" && asset.currentScore <= 1.0).length;

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <section className="hero-panel mb-8 grid gap-6 p-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="section-kicker">Asset Directory</div>
            <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.06em] text-foreground">
              Review the network before the next score drop triggers action.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Filter mentally by severity, open the most stressed assets, and move directly into the reporting flow
              that powers the alert and work-order engine.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total assets</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">{assets.length}</div>
            </div>
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Priority cases</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">{riskyAssets}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {assets.map((asset) => (
            <div key={asset.id} className="surface-card p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-mono text-muted-foreground">
                      {asset.assetCode}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
                      style={{ backgroundColor: getScoreColor(asset.currentScore ?? -1) }}
                    >
                      {asset.currentScore?.toFixed(1) ?? "-"} / 2.0
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">{asset.name}</h2>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {asset.department?.name || "N/A"} · {asset.assetType.replace("_", " ")}
                  </div>
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {typeof asset.currentScore === "number" ? getScoreLabel(asset.currentScore) : "Unknown"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Location</div>
                  <div className="mt-2 flex items-start gap-2 text-sm font-medium text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    {asset.districtCode}, {asset.stateCode}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Open alerts</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldAlert className="h-4 w-4 text-[var(--color-critical)]" />
                    {asset.alerts.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Work orders</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Wrench className="h-4 w-4 text-[var(--color-signal)]" />
                    {asset.workOrders.length}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/assets/${asset.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Open asset
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/assets/${asset.id}/report`}
                  className="rounded-full border border-border/70 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30"
                >
                  Submit report
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
