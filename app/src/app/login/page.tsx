"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";

const demoUsers = [
  { role: "Admin", email: "admin@halfstep.in", destination: "Dashboard + alerts overview" },
  { role: "Department Officer", email: "amit@halfstep.in", destination: "Asset triage + work orders" },
  { role: "Field Inspector", email: "rajesh@halfstep.in", destination: "On-ground report workflow" },
  { role: "Citizen", email: "citizen@halfstep.in", destination: "Public issue reporting" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setError("");
  };

  return (
    <div className="app-shell min-h-[calc(100vh-4.5rem)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hero-panel p-8">
          <div className="mb-8">
            <p className="section-kicker">Role-Based Demo Entry</p>
            <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.06em] text-foreground">
              Enter the Half-Step India workflow by role.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              This screen is the merge-safe bridge between the seeded backend and the README demo story: admin insight,
              officer triage, inspector reporting, and citizen submissions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.email}
                type="button"
                onClick={() => applyDemoUser(demoUser.email)}
                className="surface-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="rounded-full bg-[rgba(11,110,79,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-safe)]">
                    {demoUser.role}
                  </div>
                </div>
                <div className="font-semibold text-foreground">{demoUser.email}</div>
                <div className="mt-2 text-sm text-muted-foreground">{demoUser.destination}</div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-signal)]">
                  Click to autofill
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="surface-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em] text-foreground">Sign in</h2>
            <p className="mt-2 text-muted-foreground">Use the seeded accounts to review the real MVP flow.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-[rgba(209,67,43,0.18)] bg-[rgba(209,67,43,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-critical)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                placeholder="role@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter seeded password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Open command center"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Demo Accounts</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {demoUsers.map((demoUser) => (
                <div key={demoUser.email}>
                  <span className="font-semibold text-foreground">{demoUser.role}</span>: {demoUser.email}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Passwords stay in the seeded backend only. Pick an account to fill the email, then enter the seeded password
              from your environment.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
