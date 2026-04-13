export function computeHalfStepIndex(scores: Array<number | null | undefined>): number {
  const validScores = scores.filter((score): score is number => typeof score === "number");
  if (validScores.length === 0) return 0;
  const total = validScores.reduce((sum, score) => sum + score, 0);
  return parseFloat((total / validScores.length).toFixed(2));
}

export function getIndexBand(index: number): { label: string; color: string } {
  if (index >= 1.6) return { label: "Healthy", color: "#22c55e" };
  if (index >= 1.1) return { label: "Watchlist", color: "#f59e0b" };
  if (index >= 0.6) return { label: "Stressed", color: "#f97316" };
  return { label: "Critical", color: "#ef4444" };
}
