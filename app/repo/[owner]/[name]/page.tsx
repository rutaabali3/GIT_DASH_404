"use client";

import React, { useEffect, useState, useCallback, use, useMemo } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  Grid,
  Typography,
  List,
  ListItem,
  Chip,
  Button,
} from "@mui/material";
import RepoHeader from "@/components/repo/RepoHeader";
import PrList from "@/components/repo/PrList";
import IssueList from "@/components/repo/IssueList";
import CommitList from "@/components/repo/CommitList";
import StaleBadge from "@/components/repo/StaleBadge";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import AdjustIcon from "@mui/icons-material/Adjust";
import CommitIcon from "@mui/icons-material/Commit";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import ErrorState from "@/components/shared/ErrorState";
import { RepoSummary, PullRequest, Issue, Commit } from "@/lib/types";
import { formatNumber, timeAgo } from "@/lib/utils";

interface RepoPageProps {
  params: Promise<{
    owner: string;
    name: string;
  }>;
  initialTab?: number;
}

export default function RepoDetailPage({ params, initialTab = 0 }: RepoPageProps) {
  const { owner, name } = use(params);

  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [repo, setRepo] = useState<RepoSummary | null>(null);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);

  const loadRepoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [repoRes, prsRes, issuesRes, commitsRes] = await Promise.all([
        fetch(`/api/repo/${owner}/${name}`),
        fetch(`/api/repo/${owner}/${name}/prs`),
        fetch(`/api/repo/${owner}/${name}/issues`),
        fetch(`/api/repo/${owner}/${name}/commits`),
      ]);

      if (!repoRes.ok) throw new Error("Failed to load repository details");

      const repoData = await repoRes.json();
      const prsData = prsRes.ok ? await prsRes.json() : [];
      const issuesData = issuesRes.ok ? await issuesRes.json() : [];
      const commitsData = commitsRes.ok ? await commitsRes.json() : [];

      setRepo(repoData);
      setPrs(prsData);
      setIssues(issuesData);
      setCommits(commitsData);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to load repository data.");
    } finally {
      setLoading(false);
    }
  }, [owner, name]);

  useEffect(() => {
    loadRepoData();
  }, [loadRepoData]);

  const openPrCount = prs.filter((p) => p.state === "open").length;
  const openIssueCount = issues.filter((i) => i.state === "open").length;

  // Recent 7-day commits
  const recentCommits7Days = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return commits.filter((c) => new Date(c.date).getTime() >= sevenDaysAgo);
  }, [commits]);

  // Stale items for this repo only
  const staleRepoItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      number: number;
      type: "PR" | "Issue";
      daysOpen: number;
      staleCategory: PullRequest["staleCategory"];
      url: string;
    }> = [];

    prs.forEach((pr) => {
      if (pr.state === "open" && pr.staleCategory !== "fresh") {
        items.push({
          id: `pr-${pr.number}`,
          title: pr.title,
          number: pr.number,
          type: "PR",
          daysOpen: pr.daysOpen,
          staleCategory: pr.staleCategory,
          url: pr.url,
        });
      }
    });

    issues.forEach((iss) => {
      if (iss.state === "open" && iss.staleCategory !== "fresh") {
        items.push({
          id: `iss-${iss.number}`,
          title: iss.title,
          number: iss.number,
          type: "Issue",
          daysOpen: iss.daysOpen,
          staleCategory: iss.staleCategory,
          url: iss.url,
        });
      }
    });

    return items.sort((a, b) => b.daysOpen - a.daysOpen);
  }, [prs, issues]);

  // Combined recent activity (last 5 items across PRs, issues, commits)
  const recentActivity = useMemo(() => {
    const list: Array<{
      id: string;
      type: "commit" | "pr" | "issue";
      title: string;
      date: string;
      author: string;
      url: string;
    }> = [];

    commits.slice(0, 5).forEach((c) => {
      list.push({
        id: `commit-${c.sha}`,
        type: "commit",
        title: c.message.split("\n")[0],
        date: c.date,
        author: c.author,
        url: c.url,
      });
    });

    prs.slice(0, 5).forEach((p) => {
      list.push({
        id: `pr-${p.number}`,
        type: "pr",
        title: p.title,
        date: p.updatedAt,
        author: p.author,
        url: p.url,
      });
    });

    issues.slice(0, 5).forEach((i) => {
      list.push({
        id: `issue-${i.number}`,
        type: "issue",
        title: i.title,
        date: i.updatedAt,
        author: i.author,
        url: i.url,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [commits, prs, issues]);

  if (error) {
    return <ErrorState message={error} onRetry={loadRepoData} />;
  }

  if (loading || !repo) {
    return (
      <Box sx={{ py: 4 }}>
        <ListSkeleton count={4} />
      </Box>
    );
  }

  return (
    <Box>
      <RepoHeader repo={repo} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, val) => setTab(val)}>
          <Tab label="Overview" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label={`Pull Requests (${openPrCount})`} sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label={`Issues (${openIssueCount})`} sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label={`Commits (${commits.length})`} sx={{ textTransform: "none", fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      {tab === 0 && (
        <Box>
          {/* Stat Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Stars
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {formatNumber(repo.stars)}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Forks
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {formatNumber(repo.forks)}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Open PRs
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "primary.main" }}>
                  {openPrCount}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Open Issues
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "error.main" }}>
                  {openIssueCount}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Repo Stale Summary if any */}
          {staleRepoItems.length > 0 && (
            <Card
              variant="outlined"
              sx={{
                mb: 4,
                p: 2.5,
                borderColor: "warning.main",
                bgcolor: "rgba(210, 153, 34, 0.04)",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Lingering Items in this Repo ({staleRepoItems.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                PRs and issues open for more than 30 days that may need review or closure.
              </Typography>

              <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {staleRepoItems.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      py: 1,
                      px: 1.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                      <Chip label={item.type} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        #{item.number}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                      <StaleBadge category={item.staleCategory} daysOpen={item.daysOpen} />
                      <Button
                        component="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                      >
                        View
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          {/* Recent Activity List */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Recent Activity
            </Typography>
            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {recentActivity.map((act) => (
                <ListItem
                  key={act.id}
                  sx={{
                    p: 1.8,
                    bgcolor: "background.paper",
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                    {act.type === "commit" && <CommitIcon sx={{ color: "primary.main", fontSize: 20 }} />}
                    {act.type === "pr" && <CallMergeIcon sx={{ color: "#8957E5", fontSize: 20 }} />}
                    {act.type === "issue" && <AdjustIcon sx={{ color: "error.main", fontSize: 20 }} />}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {act.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by <strong>{act.author}</strong> • {timeAgo(act.date)}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    component="a"
                    href={act.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{ flexShrink: 0 }}
                  >
                    Details
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      )}

      {/* Tab 1: Pull Requests */}
      {tab === 1 && <PrList prs={prs} />}

      {/* Tab 2: Issues */}
      {tab === 2 && <IssueList issues={issues} />}

      {/* Tab 3: Commits */}
      {tab === 3 && <CommitList commits={commits} />}
    </Box>
  );
}
