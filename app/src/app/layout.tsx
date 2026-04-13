import type { Metadata } from "next";
import Link from "next/link";
import { Sora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Hack2Skill | Half-Step India",
  description: "Proactive infrastructure monitoring for public assets using half-step condition scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${sourceSans.variable}`}>
        <div className="min-h-screen bg-background text-foreground">
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-signal),var(--color-critical))] text-sm font-black text-white shadow-[0_10px_24px_rgba(209,67,43,0.28)]">
                  HS
                </span>
                <div className="leading-tight">
                  <div className="font-heading text-base font-semibold tracking-[-0.03em] sm:text-lg">
                    Half-Step India
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Hack2Skill MVP
                  </div>
                </div>
              </Link>

              <div className="rounded-full border border-border/70 bg-card px-4 py-2 text-right shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Deployment Track
                </div>
                <div className="text-sm font-semibold text-foreground">App workspace active</div>
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
