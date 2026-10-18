// TypeScript Types for GIT-DASH

export interface UserProfile {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  openIssues: number;
  openPRs: number;
  profileUrl: string;
}

export interface RepoSummary {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  updatedAt: string;
  pushedAt: string;
  url: string;
  staleCount?: {
    stale30: number;
    stale60: number;
    stale90: number;
  };
}

export interface ReposResponse {
  repos: RepoSummary[];
  stats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalOpenIssues: number;
  };
  user?: {
    username: string;
    name: string;
    avatarUrl: string;
    followers: number;
  };
}

export type StaleCategory = "fresh" | "stale-30" | "stale-60" | "stale-90";

export interface Label {
  name: string;
  color: string;
  description: string | null;
}

export interface PullRequest {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  labels: Label[];
  staleCategory: StaleCategory;
  daysOpen: number;
  additions?: number;
  deletions?: number;
  comments: number;
  url: string;
  repo?: string;
  repoUrl?: string;
}

export interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  labels: Label[];
  staleCategory: StaleCategory;
  daysOpen: number;
  comments: number;
  isPullRequest: boolean;
  url: string;
}

export interface Commit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  url: string;
}
