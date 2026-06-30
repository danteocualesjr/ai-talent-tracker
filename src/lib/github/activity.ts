import "server-only";

export interface GitHubActivity {
  lastCommitAt: string | null;
  commits30d: number;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: { commits?: unknown[] };
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Fetch recent public push activity for a GitHub user.
 * Uses the unauthenticated REST API (60 req/hr) or GITHUB_TOKEN when set (5000 req/hr).
 */
export async function fetchGitHubActivity(handle: string): Promise<GitHubActivity | null> {
  const normalized = handle.trim().replace(/^@/, "");
  if (!normalized) return null;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-talent-tracker",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(normalized)}/events/public?per_page=100`,
      { headers, next: { revalidate: 0 } },
    );
    if (res.status === 404) return { lastCommitAt: null, commits30d: 0 };
    if (!res.ok) {
      console.warn(`[github] ${res.status} fetching activity for ${normalized}`);
      return null;
    }

    const events = (await res.json()) as GitHubEvent[];
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    let lastCommitAt: string | null = null;
    let commits30d = 0;

    for (const event of events) {
      if (event.type !== "PushEvent") continue;
      const at = new Date(event.created_at).getTime();
      if (!lastCommitAt || at > new Date(lastCommitAt).getTime()) {
        lastCommitAt = event.created_at;
      }
      if (at >= cutoff) {
        commits30d += event.payload?.commits?.length ?? 1;
      }
    }

    return { lastCommitAt, commits30d };
  } catch (err) {
    console.warn("[github] fetch failed for", normalized, err);
    return null;
  }
}
