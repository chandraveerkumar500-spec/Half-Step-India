interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: "safe" | "signal" | "critical" | "info";
}

const accentStyles = {
  safe: "bg-[rgba(11,110,79,0.12)] text-[var(--color-safe)]",
  signal: "bg-[rgba(166,90,34,0.12)] text-[var(--color-signal)]",
  critical: "bg-[rgba(209,67,43,0.12)] text-[var(--color-critical)]",
  info: "bg-[rgba(59,130,246,0.12)] text-blue-600",
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = "info",
}: DashboardCardProps) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </div>
          <div className="mt-3 font-heading text-4xl font-semibold tracking-[-0.06em] text-foreground">
            {value}
          </div>
          {subtitle ? <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accentStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
