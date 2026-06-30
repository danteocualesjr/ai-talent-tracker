import "server-only";
import type { GitHubActivity } from "./activity";

const DARK_THRESHOLD_DAYS = 14;
const MIN_PRIOR_COMMITS = 2;

export interface GitHubDarkSignal {
  type: "github_dark";
  confidence: number;
  summary: string;
}

/**
 * Detect when a previously active GitHub user stops committing — a common
 * precursor to stealth mode or a new venture.
 */
export function detectGitHubDark(
  prev: { github_last_commit_at: string | null; github_commits_30d: number | null },
  next: GitHubActivity,
): GitHubDarkSignal | null {
  const priorCommits = prev.github_commits_30d ?? 0;
  if (priorCommits < MIN_PRIOR_COMMITS) return null;

  const lastAt = next.lastCommitAt ? new Date(next.lastCommitAt).getTime() : null;
  if (lastAt === null) {
    return {
      type: "github_dark",
      confidence: 0.75,
      summary: `GitHub activity dropped to zero (was ${priorCommits} commits in the prior 30 days)`,
    };
  }

  const daysSince = (Date.now() - lastAt) / (24 * 60 * 60 * 1000);
  if (daysSince < DARK_THRESHOLD_DAYS) return null;

  const hadRecentActivity =
    prev.github_last_commit_at &&
    Date.now() - new Date(prev.github_last_commit_at).getTime() < 45 * 24 * 60 * 60 * 1000;
  if (!hadRecentActivity) return null;

  const days = Math.floor(daysSince);
  return {
    type: "github_dark",
    confidence: Math.min(0.95, 0.7 + days * 0.01),
    summary: `No GitHub commits in ${days} days (was ${priorCommits} commits in the prior 30 days)`,
  };
}
