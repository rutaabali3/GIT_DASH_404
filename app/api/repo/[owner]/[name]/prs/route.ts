import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { categorizeStale, daysSince } from "@/lib/stale";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { PullRequest, Label } from "@/lib/types";

export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const octokit = getOctokit();
    const cacheKey = `prs:${owner}/${name}`;

    const prs = await getCached(cacheKey, CACHE_TIMES.PRS, async () => {
      const { data: prsData } = await octokit.rest.pulls.list({
        owner,
        repo: name,
        state: "all",
        per_page: 50,
        sort: "updated",
        direction: "desc",
      });

      return prsData.map((pr) => {
        const labels: Label[] = (pr.labels || []).map((l) => ({
          name: l.name || "",
          color: l.color || "cccccc",
          description: l.description || null,
        }));

        const state = pr.merged_at ? "merged" : (pr.state as "open" | "closed");
        const createdAt = pr.created_at;

        return {
          number: pr.number,
          title: pr.title,
          state,
          author: pr.user?.login || "ghost",
          authorAvatar: pr.user?.avatar_url || "",
          createdAt,
          updatedAt: pr.updated_at,
          closedAt: pr.closed_at,
          mergedAt: pr.merged_at,
          labels,
          staleCategory: categorizeStale(createdAt, pr.state),
          daysOpen: daysSince(createdAt),
          comments: (pr as unknown as { comments?: number }).comments || 0,
          url: pr.html_url,
        };
      });
    });

    return NextResponse.json(prs);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch pull requests" },
      { status: err.status || 500 }
    );
  }
}
