import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { ReposResponse, RepoSummary } from "@/lib/types";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const octokit = getOctokit();
    const cacheKey = `repos:${username || "auth_user"}`;

    const response = await getCached(cacheKey, CACHE_TIMES.REPOS, async () => {
      // If username is provided, fetch for that user; else fetch for authenticated user
      let reposData;
      if (username) {
        const res = await octokit.rest.repos.listForUser({
          username,
          per_page: 100,
          sort: "updated",
        });
        reposData = res.data;
      } else {
        const res = await octokit.rest.repos.listForAuthenticatedUser({
          per_page: 100,
          sort: "updated",
          affiliation: "owner",
        });
        reposData = res.data;
      }

      let totalStars = 0;
      let totalForks = 0;
      let totalOpenIssues = 0;

      const repos: RepoSummary[] = reposData.map((r) => {
        totalStars += r.stargazers_count || 0;
        totalForks += r.forks_count || 0;
        totalOpenIssues += r.open_issues_count || 0;

        return {
          owner: r.owner.login,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          language: r.language || null,
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          openIssues: r.open_issues_count || 0,
          isPrivate: r.private,
          isFork: r.fork,
          isArchived: r.archived || false,
          updatedAt: r.updated_at || new Date().toISOString(),
          pushedAt: r.pushed_at || new Date().toISOString(),
          url: r.html_url,
        };
      });

      let userInfo: { username: string; name: string; avatarUrl: string; followers: number } | undefined;
      try {
        if (!username) {
          const { data: authUser } = await octokit.rest.users.getAuthenticated();
          userInfo = {
            username: authUser.login,
            name: authUser.name || authUser.login,
            avatarUrl: authUser.avatar_url,
            followers: authUser.followers,
          };
        }
      } catch {
        // Fallback gracefully
      }

      return {
        repos,
        stats: {
          totalRepos: repos.length,
          totalStars,
          totalForks,
          totalOpenIssues,
        },
        user: userInfo,
      };
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch repositories" },
      { status: err.status || 500 }
    );
  }
}
