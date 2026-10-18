import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { UserProfile } from "@/lib/types";

export const revalidate = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const octokit = getOctokit();
    const cacheKey = `user:${username}`;

    const profile = await getCached(cacheKey, CACHE_TIMES.USER, async () => {
      // Fetch user profile
      const { data: user } = await octokit.rest.users.getByUsername({
        username,
      });

      // Fetch repositories to calculate aggregate stars & issues
      const { data: repos } = await octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        type: "owner",
        sort: "updated",
      });

      let totalStars = 0;
      let totalIssues = 0;

      for (const repo of repos) {
        totalStars += repo.stargazers_count || 0;
        totalIssues += repo.open_issues_count || 0;
      }

      // Query open PRs count across repositories
      let openPRs = 0;
      try {
        const { data: prSearchResults } = await octokit.rest.search.issuesAndPullRequests({
          q: `type:pr user:${username} state:open`,
          per_page: 1,
        });
        openPRs = prSearchResults.total_count;
      } catch {
        // Fallback
      }

      return {
        username: user.login,
        avatarUrl: user.avatar_url,
        name: user.name || user.login,
        bio: user.bio || "",
        publicRepos: user.public_repos,
        totalStars,
        followers: user.followers,
        following: user.following,
        openIssues: totalIssues,
        openPRs,
        profileUrl: user.html_url,
      } as UserProfile;
    });

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch user profile" },
      { status: err.status || 500 }
    );
  }
}
