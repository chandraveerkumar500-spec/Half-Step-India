import Link from "next/link";
import { AlertSeverity, WorkOrderStatus } from "@prisma/client";
import { ArrowRight, MapPin } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import DashboardClient from "./DashboardClient";
import { prisma } from "@/lib/db";
import { computeHalfStepIndex, getIndexBand } from "@/lib/score-utils";
import { getScoreColor } from "@/lib/scoring";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [assets, activeAlerts, openWorkOrders, criticalAlerts, recentAlerts, lowScoreAssets] = await Promise.all([
    prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        assetCode: true,
        currentScore: true,
        districtCode: true,
        stateCode: true,
        assetType: true,
        department: { select: { name: true } },
      },
    }),
    prisma.alert.count({ where: { isAcknowledged: false } }),
    prisma.workOrder.count({
      where: { status: { in: [WorkOrderStatus.open, WorkOrderStatus.in_progress] } },
    }),
    prisma.alert.count({
      where: { severity: AlertSeverity.critical, isAcknowledged: false },
    }),
    prisma.alert.findMany({
      where: { isAcknowledged: false },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.asset.findMany({
      where: { currentScore: { lte: 1.0 } },
      orderBy: { currentScore: "asc" },
      take: 6,
      include: { department: true },
    }),
  ]);

  return { assets, activeAlerts, openWorkOrders, criticalAlerts, recentAlerts, lowScoreAssets };
}

export default async function DashboardPage() {
  const { assets, activeAlerts, openWorkOrders, criticalAlerts, recentAlerts, lowScoreAssets } =
    await getDashboardData();

  const halfStepIndex = computeHalfStepIndex(assets.map((asset) => asset.currentScore));
  const band = getIndexBand(halfStepIndex);
  const riskyAssets = assets.filter((asset) => typeof asset.currentScore === "number" && asset.currentScore <= 1.0).length;
  const scoreBuckets = assets.reduce(
    (buckets, asset) => {
      const score = asset.currentScore ?? 0;

      if (score >= 1.8) {
        buckets.perfect += 1;
      } else if (score >= 1.3) {
        buckets.minor += 1;
      } else if (score >= 0.8) {
        buckets.moderate += 1;
      } else if (score > 0) {
        buckets.severe += 1;
      } else {
        buckets.dead += 1;
      }

      return buckets;
    },
    { perfect: 0, minor: 0, moderate: 0, severe: 0, dead: 0 }
  );

  const chartData = [
    {
      label: "Perfect",
      count: scoreBuckets.perfect,
      fill: "#22c55e",
    },
    {
      label: "Minor",
      count: scoreBuckets.minor,
      fill: "#84cc16",
    },
    {
      label: "Moderate",
      count: scoreBuckets.moderate,
      fill: "#eab308",
    },
    {
      label: "Severe",
      count: scoreBuckets.severe,
      fill: "#f97316",
    },
    {
      label: "Dead",
      count: scoreBuckets.dead,
      fill: "#ef4444",
    },
  ];

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <section className="hero-panel mb-8 grid gap-8 p-8 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-5">
            <p className="section-kicker">Operations Command Center</p>
            <div className="space-y-4">
              <h1 className="font-heading text-5xl font-semibold tracking-[-0.06em] text-foreground">
                Detect the half-step before infrastructure breaks.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                Review district health, surface threshold alerts, and move directly from insight to reporting on the
                assets that are slipping toward failure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/assets"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Review asset directory
              </Link>
              <Link
                href="/reports"
                className="rounded-full border border-border/70 bg-background/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30"
              >
                Open report feed
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Half-Step Index</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {halfStepIndex.toFixed(2)}
              </div>
              <div className="mt-2 text-sm font-semibold" style={{ color: band.color }}>
                {band.label}
              </div>
            </div>
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">At-risk assets</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {riskyAssets}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Scores at 1.0 or below</div>
            </div>
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Open alerts</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {activeAlerts}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Including {criticalAlerts} critical</div>
            </div>
            <div className="metric-panel p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Work orders</div>
              <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {openWorkOrders}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Open or in progress</div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Total Assets" value={assets.length} icon="Grid" subtitle="Seeded demo network" color="info" />
          <DashboardCard title="Open Alerts" value={activeAlerts} icon="Bell" subtitle="Unacknowledged warnings" color="critical" />
          <DashboardCard title="Dispatch Queue" value={openWorkOrders} icon="Fix" subtitle="Maintenance waiting" color="signal" />
          <DashboardCard title="Critical Risk" value={criticalAlerts} icon="Risk" subtitle="Immediate response required" color="critical" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <DashboardClient chartData={chartData} />

          <div className="space-y-6">
            <div className="surface-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="section-kicker">Alert Feed</div>
                  <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    Actionable deterioration
                  </h2>
                </div>
                <Link href="/alerts" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No active alerts.
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-foreground">{alert.asset.name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{alert.message}</div>
                        </div>
                        <div className="rounded-full bg-[rgba(209,67,43,0.12)] px-3 py-1 text-xs font-semibold uppercase text-[var(--color-critical)]">
                          {alert.severity}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {alert.asset.districtCode}, {alert.asset.stateCode}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="section-kicker">Intervention Queue</div>
                  <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    Low-score assets
                  </h2>
                </div>
                <Link href="/assets" className="text-sm font-semibold text-primary">
                  Open assets
                </Link>
              </div>
              <div className="space-y-3">
                {lowScoreAssets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:border-primary/30"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{asset.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {asset.department?.name} - {asset.assetType.replace("_", " ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: asset.currentScore !== null ? getScoreColor(asset.currentScore) : "#6b7280" }}>
                        {asset.currentScore?.toFixed(1) ?? "-"}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-1 text-xs font-semibold text-primary">
                        Open
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
                {lowScoreAssets.length === 0 ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No low-score assets.
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
