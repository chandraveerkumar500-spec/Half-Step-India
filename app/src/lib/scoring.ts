import { AlertSeverity, WorkOrderPriority } from "@prisma/client"

const VALID_SCORES = [0.0, 0.5, 1.0, 1.5, 2.0]

export function isValidScore(score: number): boolean {
  return VALID_SCORES.includes(score)
}

export interface EvaluationResult {
  alert: {
    type: string
    severity: AlertSeverity
    message: string
  } | null
  workOrder: {
    priority: WorkOrderPriority
    reason: string
  } | null
}

export function evaluateReport(
  previousScore: number | null,
  newScore: number,
  assetName: string
): EvaluationResult {
  if (!isValidScore(newScore)) {
    throw new Error(`Invalid score: ${newScore}. Must be one of: ${VALID_SCORES.join(", ")}`)
  }

  if (previousScore === null) {
    return { alert: null, workOrder: null }
  }

  // 1.5 to 1.0: Medium alert
  if (previousScore === 1.5 && newScore === 1.0) {
    return {
      alert: {
        type: "threshold_drop",
        severity: AlertSeverity.medium,
        message: `${assetName} degraded from minor to moderate degradation`,
      },
      workOrder: null,
    }
  }

  // 1.0 to 0.5: High alert + work order
  if (previousScore === 1.0 && newScore === 0.5) {
    return {
      alert: {
        type: "threshold_drop",
        severity: AlertSeverity.high,
        message: `${assetName} degraded from moderate to severe degradation`,
      },
      workOrder: {
        priority: WorkOrderPriority.high,
        reason: "Rapid degradation to severe state",
      },
    }
  }

  // Any drop to 0.0: Critical alert + critical work order
  if (newScore === 0.0 && previousScore > 0) {
    return {
      alert: {
        type: "asset_dead",
        severity: AlertSeverity.critical,
        message: `${assetName} is now non-functional`,
      },
      workOrder: {
        priority: WorkOrderPriority.critical,
        reason: "Asset non-functional",
      },
    }
  }

  // Significant drops (more than 0.5 at once)
  if (previousScore - newScore >= 1.0) {
    return {
      alert: {
        type: "rapid_decline",
        severity: AlertSeverity.high,
        message: `${assetName} declined rapidly from ${previousScore} to ${newScore}`,
      },
      workOrder: {
        priority: WorkOrderPriority.high,
        reason: `Rapid decline of ${(previousScore - newScore).toFixed(1)} points`,
      },
    }
  }

  return { alert: null, workOrder: null }
}

export function calculateHalfStepIndex(scores: { count: number; score: number }[]): number {
  const totalAssets = scores.reduce((sum, s) => sum + s.count, 0)
  if (totalAssets === 0) return 0

  const weightedSum = scores.reduce((sum, s) => sum + s.count * s.score, 0)
  return weightedSum / totalAssets
}

export function getScoreInterpretation(index: number): string {
  if (index >= 1.6) return "healthy"
  if (index >= 1.1) return "watchlist"
  if (index >= 0.6) return "stressed"
  return "critical"
}

export function getScoreColor(score: number): string {
  switch (score) {
    case 2.0:
      return "#22c55e" // green
    case 1.5:
      return "#84cc16" // lime
    case 1.0:
      return "#eab308" // yellow
    case 0.5:
      return "#f97316" // orange
    case 0.0:
      return "#ef4444" // red
    default:
      return "#6b7280" // gray
  }
}

export function getScoreLabel(score: number): string {
  switch (score) {
    case 2.0:
      return "Perfect"
    case 1.5:
      return "Minor Degradation"
    case 1.0:
      return "Moderate Degradation"
    case 0.5:
      return "Severe Degradation"
    case 0.0:
      return "Non-Functional"
    default:
      return "Unknown"
  }
}
