import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";
import { getCached, CACHE_TIMES } from "@/lib/cache";
import { Commit } from "@/lib/types";

export const revalidate = 120;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const octokit = getOctokit();
    const cacheKey = `commits:${owner}/${name}`;

    const commits = await getCached(cacheKey, CACHE_TIMES.COMMITS, async () => {
      const { data: commitsData } = await octokit.rest.repos.listCommits({
        owner,
        repo: name,
        per_page: 30,
      });

      return commitsData.map((c) => ({
        sha: c.sha,
        shortSha: c.sha.substring(0, 7),
        message: c.commit.message,
        author: c.author?.login || c.commit.author?.name || "Unknown",
        authorAvatar: c.author?.avatar_url || "",
        date: c.commit.author?.date || new Date().toISOString(),
        url: c.html_url,
      }));
    });

    return NextResponse.json(commits);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Failed to fetch commits" },
      { status: err.status || 500 }
    );
  }
}
