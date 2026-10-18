import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { categorizeStale, daysSince } from "@/lib/stale";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { StaleCategory } from "@/lib/types";

export const revalidate = 60;

export interface StaleApiResponseItem {
  id: string;
  repo: string;
  number: number;
  title: string;
  type: "PR" | "Issue";
  daysOpen: number;
  staleCategory: StaleCategory;
  url: string;
}

export async function GET() {
  try {
    const octokit = getOctokit();

    // Authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    const cacheKey = `stale:${username}`;

    const staleResult = await getCached(cacheKey, CACHE_TIMES.STALE, async () => {
      // 30 days ago date string YYYY-MM-DD
      const date30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Query stale open PRs and issues across ALL user repositories simultaneously in 2 targeted searches
      const [prsRes, issuesRes] = await Promise.all([
        octokit.rest.search.issuesAndPullRequests({
          q: `type:pr user:${username} state:open created:<=${date30DaysAgo}`,
          sort: "created",
          order: "asc",
          per_page: 50,
        }),
        octokit.rest.search.issuesAndPullRequests({
          q: `type:issue user:${username} state:open created:<=${date30DaysAgo}`,
          sort: "created",
          order: "asc",
          per_page: 50,
        }),
      ]);

      const items: StaleApiResponseItem[] = [];
      const repoStaleCountMap: Record<string, { stale30: number; stale60: number; stale90: number }> = {};

      const processItem = (item: typeof prsRes.data.items[0], type: "PR" | "Issue") => {
        const cat = categorizeStale(item.created_at, item.state);
        if (cat === "fresh") return;

        const repoName = item.repository_url
          ? item.repository_url.split("/").slice(-2).join("/")
          : "unknown";

        if (!repoStaleCountMap[repoName]) {
          repoStaleCountMap[repoName] = { stale30: 0, stale60: 0, stale90: 0 };
        }
        if (cat === "stale-90") repoStaleCountMap[repoName].stale90++;
        else if (cat === "stale-60") repoStaleCountMap[repoName].stale60++;
        else if (cat === "stale-30") repoStaleCountMap[repoName].stale30++;

        items.push({
          id: `${type.toLowerCase()}-${repoName}-${item.number}`,
          repo: repoName,
          number: item.number,
          title: item.title,
          type,
          daysOpen: daysSince(item.created_at),
          staleCategory: cat,
          url: item.html_url,
        });
      };

      prsRes.data.items.forEach((item) => processItem(item, "PR"));
      issuesRes.data.items.forEach((item) => processItem(item, "Issue"));

      items.sort((a, b) => b.daysOpen - a.daysOpen);

      return {
        items,
        repoStaleMap: repoStaleCountMap,
      };
    });

    return NextResponse.json(staleResult);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch stale items" },
      { status: err.status || 500 }
    );
  }
}
