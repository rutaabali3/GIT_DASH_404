// Stale PR/issue detection logic
import { StaleCategory } from "./types";

export function daysSince(dateString: string): number {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function categorizeStale(createdAt: string, state: string): StaleCategory {
  if (state !== "open") return "fresh";

  const daysOpen = daysSince(createdAt);

  if (daysOpen >= 90) return "stale-90";
  if (daysOpen >= 60) return "stale-60";
  if (daysOpen >= 30) return "stale-30";
  return "fresh";
}
