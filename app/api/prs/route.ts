import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { categorizeStale, daysSince } from "@/lib/stale";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { PullRequest, Label } from "@/lib/types";

export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || "open"; // 'open' | 'closed' | 'all'
    const octokit = getOctokit();

    // Fetch authenticated user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    const cacheKey = `prs:${username}:${state}`;

    const result = await getCached(cacheKey, CACHE_TIMES.PRS, async () => {
      // Search for all PRs in the user's repositories
      const stateQuery = state === "all" ? "" : `state:${state}`;
      const q = `type:pr user:${username} ${stateQuery}`.trim();

      const { data: searchResults } = await octokit.rest.search.issuesAndPullRequests({
        q,
        sort: "updated",
        order: "desc",
        per_page: 100,
      });

      const prs: PullRequest[] = searchResults.items.map((item) => {
        const labels: Label[] = (item.labels || []).map((l) => ({
          name: l.name || "",
          color: l.color || "cccccc",
          description: l.description || null,
        }));

        const isMerged = !!item.pull_request?.merged_at;
        const prState = isMerged ? "merged" : (item.state as "open" | "closed");
        const createdAt = item.created_at;

        const repoFullName = item.repository_url
          ? item.repository_url.split("/").slice(-2).join("/")
          : undefined;

        return {
          number: item.number,
          title: item.title,
          state: prState,
          author: item.user?.login || username,
          authorAvatar: item.user?.avatar_url || "",
          createdAt,
          updatedAt: item.updated_at,
          closedAt: item.closed_at,
          mergedAt: item.pull_request?.merged_at || null,
          labels,
          staleCategory: categorizeStale(createdAt, item.state),
          daysOpen: daysSince(createdAt),
          comments: item.comments || 0,
          url: item.html_url,
          repo: repoFullName,
        };
      });

      return {
        total: searchResults.total_count,
        prs,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch user pull requests" },
      { status: err.status || 500 }
    );
  }
}
