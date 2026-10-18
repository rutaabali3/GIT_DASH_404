"use client";

import React from "react";
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import AdjustIcon from "@mui/icons-material/Adjust";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Link from "next/link";
import { RepoSummary } from "@/lib/types";
import { timeAgo, formatNumber } from "@/lib/utils";

// Language color lookup
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#563D7C",
  PHP: "#4F5D95",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#F34B7D",
  "C#": "#178600",
  Shell: "#89E051",
  Dart: "#00B4AB",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

interface RepoCardProps {
  repo: RepoSummary;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const langColor = repo.language ? LANG_COLORS[repo.language] || "#8B949E" : null;
  const hasStale = repo.staleCount && (repo.staleCount.stale30 > 0 || repo.staleCount.stale60 > 0 || repo.staleCount.stale90 > 0);
  const isSevereStale = repo.staleCount && repo.staleCount.stale90 > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/repo/${repo.owner}/${repo.name}`}
        sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
      >
        {/* Repo Header */}
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1, gap: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "primary.main", flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {repo.name}
          </Typography>

          {hasStale && (
            <Tooltip title={`Has items needing attention (${repo.staleCount?.stale90 ? `${repo.staleCount.stale90} >90d` : `${repo.staleCount?.stale60 ? `${repo.staleCount.stale60} >60d` : `${repo.staleCount?.stale30} >30d`}`})`}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: isSevereStale ? "error.main" : "#ED6C02",
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )}

          {repo.isPrivate && (
            <Tooltip title="Private repository">
              <LockOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            </Tooltip>
          )}
          {repo.isFork && (
            <Chip label="Fork" size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
          )}
          {repo.isArchived && (
            <Chip label="Archived" size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "2.8em",
          }}
        >
          {repo.description || "No description provided."}
        </Typography>

        {/* Bottom meta stats */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 2,
            flexWrap: "wrap",
            pt: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            mt: "auto",
          }}
        >
          {repo.language && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: langColor,
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                {repo.language}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <StarBorderRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {formatNumber(repo.stars)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <AltRouteIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {formatNumber(repo.forks)}
            </Typography>
          </Box>

          {repo.openIssues > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <AdjustIcon sx={{ fontSize: 16, color: "error.main" }} />
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                {repo.openIssues}
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
            {timeAgo(repo.pushedAt)}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
