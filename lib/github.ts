import { Octokit } from "@octokit/rest";

let octokitInstance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (octokitInstance) return octokitInstance;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not configured in environment variables. Please add your GitHub Personal Access Token to .env.local to access private and public repository data."
    );
  }

  octokitInstance = new Octokit({
    auth: token,
  });

  return octokitInstance;
}
