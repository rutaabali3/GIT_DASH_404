import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { RepoSummary } from "@/lib/types";

export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const octokit = getOctokit();
    const cacheKey = `repo:${owner}/${name}`;

    const repo = await getCached(cacheKey, CACHE_TIMES.REPO_STATS, async () => {
      const { data: r } = await octokit.rest.repos.get({
        owner,
        repo: name,
      });

      return {
        owner: r.owner.login,
        name: r.name,
        fullName: r.full_name,
        description: r.description || null,
        language: r.language || null,
        stars: r.stargazers_count,
        forks: r.forks_count,
        openIssues: r.open_issues_count,
        isPrivate: r.private,
        isFork: r.fork,
        isArchived: r.archived,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        url: r.html_url,
      } as RepoSummary;
    });

    return NextResponse.json(repo);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch repository" },
      { status: err.status || 500 }
    );
  }
}
