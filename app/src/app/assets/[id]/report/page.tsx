"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Navigation, Upload } from "lucide-react";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

const scores = [
  { value: 2.0, label: "2.0", desc: "Perfect", color: "bg-green-500 hover:bg-green-600 border-green-600" },
  { value: 1.5, label: "1.5", desc: "Minor", color: "bg-lime-500 hover:bg-lime-600 border-lime-600" },
  { value: 1.0, label: "1.0", desc: "Moderate", color: "bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-slate-900" },
  { value: 0.5, label: "0.5", desc: "Severe", color: "bg-orange-500 hover:bg-orange-600 border-orange-600" },
  { value: 0.0, label: "0.0", desc: "Dead", color: "bg-red-600 hover:bg-red-700 border-red-700" },
];

export default function ReportPage({ params }: ReportPageProps) {
  const { id } = use(params);
  const [score, setScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      (gpsError) => {
        setError(`GPS Error: ${gpsError.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (score === null) {
      setError("Please select a score");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: id,
          score,
          notes: photoName ? `${notes}${notes ? "\n\n" : ""}Attachment: ${photoName}` : notes,
          photoUrl: null,
          latitude: latitude.trim() ? Number(latitude) : null,
          longitude: longitude.trim() ? Number(longitude) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      router.push(`/assets/${id}`);
      router.refresh();
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-8">
          <Link href={`/assets/${id}`} className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
            Back to asset
          </Link>
        </div>

        <section className="hero-panel mb-6 p-8">
          <div className="section-kicker">Inspector Workflow</div>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-foreground">
            Submit a fresh half-step report.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Use the five score buttons, add field notes, and attach demo evidence so the alert engine can react to the
            latest condition change.
          </p>
        </section>

        {error ? (
          <div className="mb-4 rounded-2xl border border-[rgba(209,67,43,0.18)] bg-[rgba(209,67,43,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-critical)]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="surface-card overflow-hidden">
            <button
              type="button"
              onClick={requestLocation}
              disabled={gpsLoading}
              className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-background/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                {gpsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-heading text-xl font-semibold text-foreground">Use exact GPS location</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {latitude && longitude
                    ? `Location captured at ${latitude}, ${longitude}.`
                    : `Fetch coordinates directly from the device before submitting the report.`}
                </div>
              </div>
            </button>
          </div>

          <div className="surface-card p-6">
            <div className="mb-3 text-sm font-semibold text-foreground">Current condition score</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {scores.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setScore(item.value)}
                  className={`rounded-2xl border-b-4 px-2 py-4 text-white transition ${
                    score === item.value ? "scale-105 border-b-8 ring-2 ring-slate-900 ring-offset-2 shadow-lg" : "opacity-90 hover:-translate-y-0.5 hover:opacity-100"
                  } ${item.color}`}
                >
                  <div className="text-3xl font-black">{item.label}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em]">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Field notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe physical damage, public impact, hazards, or reasons for the score change..."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Photo evidence UI</label>
                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 p-5 text-center">
                    <Upload className="mb-3 h-5 w-5 text-primary" />
                    <div className="font-semibold text-foreground">{photoName || "Choose a demo image"}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Upload plumbing is not wired yet, but the frontend intake step is now present.
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                      placeholder="19.0760"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                      placeholder="72.8777"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || score === null}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit report"}
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </button>
            <Link
              href={`/assets/${id}`}
              className="rounded-full border border-border/70 bg-background/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
