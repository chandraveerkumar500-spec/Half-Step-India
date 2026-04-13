"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, ClipboardList, LayoutDashboard, LogOut, ShieldAlert, UserRound } from "lucide-react";
import { getRoleLabel, hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: ShieldAlert },
  { href: "/reports", label: "Reports", icon: ClipboardList },
  { href: "/alerts", label: "Alerts", icon: Bell, roles: MANAGEMENT_ROLES },
  { href: "/work-orders", label: "Work Orders", icon: ClipboardList, roles: MANAGEMENT_ROLES },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter((item) => !item.roles || hasRoleAccess(user.role, item.roles));

  return (
    <aside className="w-[19rem] shrink-0 border-r border-border/70 bg-card/80 backdrop-blur-xl">
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col px-5 py-6">
        <div className="surface-card mb-6 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
                {user.name || "User"}
              </div>
              <div className="text-sm text-muted-foreground">{getRoleLabel(user.role)}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            {user.email || "No email attached"}
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(11,110,79,0.18)]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
