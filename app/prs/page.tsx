"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PrList from "@/components/repo/PrList";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import ErrorState from "@/components/shared/ErrorState";
import { PullRequest } from "@/lib/types";

export default function PullRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const fetchPrs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prs?state=all");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch pull requests");
      }
      const data = await res.json();
      setPrs(data.prs || []);
      setTotal(data.total ?? (data.prs?.length || 0));
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to load pull requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrs();
  }, [fetchPrs]);

  return (
    <Box>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Pull Requests
            </Typography>
            {total !== null && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  bgcolor: "action.selected",
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 2,
                }}
              >
                {total}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track and manage all your active and closed pull requests across repositories
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPrs}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {error ? (
        <ErrorState message={error} onRetry={fetchPrs} />
      ) : loading ? (
        <ListSkeleton count={6} />
      ) : (
        <PrList prs={prs} />
      )}
    </Box>
  );
}
