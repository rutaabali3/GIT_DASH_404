import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { categorizeStale, daysSince } from "@/lib/stale";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { Issue, Label } from "@/lib/types";

export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const octokit = getOctokit();
    const cacheKey = `issues:${owner}/${name}`;

    const issues = await getCached(cacheKey, CACHE_TIMES.ISSUES, async () => {
      // In GitHub REST API, issues endpoint returns both issues and pull requests
      const { data: issuesData } = await octokit.rest.issues.listForRepo({
        owner,
        repo: name,
        state: "all",
        per_page: 50,
        sort: "updated",
        direction: "desc",
      });

      // Filter out pull requests
      const pureIssues = issuesData.filter((item) => !item.pull_request);

      return pureIssues.map((issue) => {
        const labels: Label[] = (issue.labels || []).map((l) => {
          if (typeof l === "string") {
            return { name: l, color: "cccccc", description: null };
          }
          return {
            name: l.name || "",
            color: l.color || "cccccc",
            description: l.description || null,
          };
        });

        const createdAt = issue.created_at;

        return {
          number: issue.number,
          title: issue.title,
          state: issue.state as "open" | "closed",
          author: issue.user?.login || "ghost",
          authorAvatar: issue.user?.avatar_url || "",
          createdAt,
          updatedAt: issue.updated_at,
          closedAt: issue.closed_at || null,
          labels,
          staleCategory: categorizeStale(createdAt, issue.state),
          daysOpen: daysSince(createdAt),
          comments: issue.comments || 0,
          isPullRequest: false,
          url: issue.html_url,
        };
      });
    });

    return NextResponse.json(issues);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch issues" },
      { status: err.status || 500 }
    );
  }
}
