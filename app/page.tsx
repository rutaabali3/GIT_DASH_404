"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StatStrip from "@/components/dashboard/StatStrip";
import RepoGrid from "@/components/dashboard/RepoGrid";
import StaleCallouts, { StaleItem } from "@/components/dashboard/StaleCallouts";
import { StatStripSkeleton, RepoGridSkeleton } from "@/components/shared/LoadingSkeleton";
import ErrorState from "@/components/shared/ErrorState";
import { ReposResponse, UserProfile, RepoSummary } from "@/lib/types";

const LOCAL_STORAGE_REPOS_KEY = "gitdash_cached_repos_v1";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reposData, setReposData] = useState<ReposResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [openPRs, setOpenPRs] = useState(0);
  const [staleItems, setStaleItems] = useState<StaleItem[]>([]);

  // 1. Instant local cache hydration: show previous data in 0 milliseconds
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_REPOS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.reposData) {
          setReposData(parsed.reposData);
          setLoading(false); // Instantly display the grid!
        }
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.openPRs) setOpenPRs(parsed.openPRs);
        if (parsed.staleItems) setStaleItems(parsed.staleItems);
      }
    } catch {
      // Ignore cache parse error
    }
  }, []);

  const loadData = useCallback(async () => {
    setError(null);

    // Step A: Load Repositories and User info immediately (fastest path: ~300-400ms)
    try {
      const reposRes = await fetch("/api/repos");
      if (!reposRes.ok) {
        const data = await reposRes.json();
        throw new Error(data.error || "Failed to load repositories");
      }
      const reposJson: ReposResponse = await reposRes.json();

      setReposData((prev) => {
        // Preserve any previously loaded staleCount badges
        const prevStaleMap = new Map<string, RepoSummary["staleCount"]>();
        prev?.repos.forEach((r) => {
          if (r.staleCount) prevStaleMap.set(r.fullName, r.staleCount);
        });

        return {
          ...reposJson,
          repos: reposJson.repos.map((r) => ({
            ...r,
            staleCount: prevStaleMap.get(r.fullName),
          })),
        };
      });

      if (reposJson.user) {
        setProfile({
          username: reposJson.user.username,
          name: reposJson.user.name,
          avatarUrl: reposJson.user.avatarUrl,
          bio: "",
          publicRepos: reposJson.stats.totalRepos,
          totalStars: reposJson.stats.totalStars,
          followers: reposJson.user.followers,
          following: 0,
          openIssues: reposJson.stats.totalOpenIssues,
          openPRs: 0,
          profileUrl: `https://github.com/${reposJson.user.username}`,
        });
      }

      // Repositories are now ready and rendered! Stop skeleton loading immediately
      setLoading(false);

      // Save to local cache for instant future loads
      try {
        localStorage.setItem(
          LOCAL_STORAGE_REPOS_KEY,
          JSON.stringify({
            reposData: reposJson,
            profile: reposJson.user ? {
              username: reposJson.user.username,
              name: reposJson.user.name,
              avatarUrl: reposJson.user.avatarUrl,
              followers: reposJson.user.followers,
            } : null,
          })
        );
      } catch {
        // Ignore storage quota
      }

      // Step B: Asynchronously stream in Open PRs count in background
      fetch("/api/prs?state=open")
        .then((res) => (res.ok ? res.json() : null))
        .then((prsData) => {
          if (prsData) {
            const count = prsData.total ?? (prsData.prs?.length || 0);
            setOpenPRs(count);
          }
        })
        .catch(() => {});

      // Step C: Asynchronously stream in Stale Items and status dots in background
      fetch("/api/stale")
        .then((res) => (res.ok ? res.json() : null))
        .then((staleData) => {
          if (staleData) {
            const items = staleData.items || [];
            const staleMap: Record<string, { stale30: number; stale60: number; stale90: number }> =
              staleData.repoStaleMap || {};

            setStaleItems(items);

            // Dynamically annotate repos with their stale indicator dots
            setReposData((curr) => {
              if (!curr) return curr;
              return {
                ...curr,
                repos: curr.repos.map((r) => ({
                  ...r,
                  staleCount: staleMap[r.fullName],
                })),
              };
            });
          }
        })
        .catch(() => {});
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Box>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile ? `Welcome back, ${profile.name || profile.username}` : "Your GitHub command center"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            loadData();
          }}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Main Content */}
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : loading && !reposData ? (
        <>
          <StatStripSkeleton />
          <RepoGridSkeleton />
        </>
      ) : (
        <>
          {reposData && (
            <StatStrip
              stats={{
                totalRepos: reposData.stats.totalRepos,
                totalStars: reposData.stats.totalStars,
                totalOpenIssues: reposData.stats.totalOpenIssues,
                totalOpenPRs: openPRs,
                totalForks: reposData.stats.totalForks,
                followers: profile?.followers || 0,
              }}
            />
          )}

          {/* Stale Alert Callouts: streams in smoothly once ready */}
          <StaleCallouts items={staleItems} />

          {/* Repositories Grid: rendered immediately */}
          {reposData && <RepoGrid repos={reposData.repos} />}
        </>
      )}
    </Box>
  );
}
