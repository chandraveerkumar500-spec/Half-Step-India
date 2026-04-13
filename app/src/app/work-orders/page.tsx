import Link from "next/link";
import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getWorkOrders() {
  return prisma.workOrder.findMany({
    include: {
      asset: true,
      triggerReport: true,
      assignedUser: { select: { name: true } },
      department: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function WorkOrdersPage() {
  const workOrders = await getWorkOrders();

  const statusColors: Record<WorkOrderStatus, string> = {
    open: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<WorkOrderPriority, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl p-8">
        <section className="hero-panel mb-8 p-8">
          <div className="section-kicker">Dispatch Queue</div>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-foreground">
            Track the maintenance orders created by score deterioration.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            This queue closes the loop between report submission and intervention, showing why each work order exists and
            which asset triggered it.
          </p>
        </section>

        <div className="space-y-4">
          {workOrders.map((workOrder) => (
            <div key={workOrder.id} className="surface-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link href={`/assets/${workOrder.assetId}`} className="font-heading text-2xl font-semibold tracking-[-0.04em] text-foreground transition hover:text-primary">
                    {workOrder.asset.name}
                  </Link>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{workOrder.reason}</div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {workOrder.department?.name || "N/A"} · Assigned to {workOrder.assignedUser?.name || "Unassigned"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${priorityColors[workOrder.priority]}`}>
                    {workOrder.priority}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusColors[workOrder.status]}`}>
                    {workOrder.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">{new Date(workOrder.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {workOrders.length === 0 ? (
            <div className="surface-card px-6 py-10 text-center text-sm text-muted-foreground">No work orders found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
