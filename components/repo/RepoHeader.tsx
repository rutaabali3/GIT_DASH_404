"use client";

import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GitHubIcon from "@mui/icons-material/GitHub";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouter } from "next/navigation";
import { RepoSummary } from "@/lib/types";

interface RepoHeaderProps {
  repo: RepoSummary;
}

export default function RepoHeader({ repo }: RepoHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Back button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Button
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ textTransform: "none", color: "text.secondary" }}
        >
          Back to Repositories
        </Button>
      </Box>

      {/* Main title bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {repo.name}
            </Typography>
            {repo.isPrivate && (
              <Chip
                icon={<LockOutlinedIcon style={{ fontSize: "0.85rem" }} />}
                label="Private"
                size="small"
                variant="outlined"
              />
            )}
            {repo.isFork && <Chip label="Fork" size="small" />}
            {repo.isArchived && <Chip label="Archived" size="small" color="warning" />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 800 }}>
            {repo.description || "No description provided."}
          </Typography>
        </Box>

        <Button
          component="a"
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<GitHubIcon />}
          size="small"
        >
          View on GitHub
        </Button>
      </Box>
    </Box>
  );
}
