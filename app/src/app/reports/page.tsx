import Link from "next/link";
import { prisma } from "@/lib/db";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

async function getReports() {
  return prisma.assetReport.findMany({
    include: {
      asset: { select: { name: true, assetCode: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <section className="hero-panel mb-8 p-8">
          <div className="section-kicker">Report Feed</div>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-foreground">
            Review every condition change entering the system.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            This feed verifies the judge story end to end: score, previous score, delta, notes, reporter, and the asset
            tied to each submission.
          </p>
        </section>

        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/70 bg-background/80">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Asset</th>
                  <th className="px-6 py-4 text-center font-semibold">Score</th>
                  <th className="px-6 py-4 text-center font-semibold">Previous</th>
                  <th className="px-6 py-4 text-center font-semibold">Delta</th>
                  <th className="px-6 py-4 font-semibold">Notes</th>
                  <th className="px-6 py-4 font-semibold">Reporter</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-border/60 bg-card/80 align-top">
                    <td className="px-6 py-4">
                      <Link href={`/assets/${report.assetId}`} className="font-semibold text-foreground transition hover:text-primary">
                        {report.asset.name}
                      </Link>
                      <div className="mt-1 text-xs font-mono text-muted-foreground">{report.asset.assetCode}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold" style={{ color: getScoreColor(report.score) }}>
                        {report.score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">{getScoreLabel(report.score)}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-foreground">{report.previousScore?.toFixed(1) || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      {report.scoreDelta !== null ? (
                        <span className={report.scoreDelta < 0 ? "font-semibold text-[var(--color-critical)]" : "font-semibold text-[var(--color-safe)]"}>
                          {report.scoreDelta > 0 ? "+" : ""}
                          {report.scoreDelta.toFixed(1)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="max-w-sm px-6 py-4 text-sm leading-6 text-muted-foreground">{report.notes || "-"}</td>
                    <td className="px-6 py-4 text-foreground">{report.reporter?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(report.reportedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">No reports found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
