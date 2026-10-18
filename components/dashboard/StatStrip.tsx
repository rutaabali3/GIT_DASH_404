"use client";

import React from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import AdjustIcon from "@mui/icons-material/Adjust";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PeopleIcon from "@mui/icons-material/People";
import { formatNumber } from "@/lib/utils";

interface StatStripProps {
  stats: {
    totalRepos: number;
    totalStars: number;
    totalOpenIssues: number;
    totalOpenPRs: number;
    totalForks: number;
    followers: number;
  };
}

export default function StatStrip({ stats }: StatStripProps) {
  const statItems = [
    {
      label: "Repositories",
      value: stats.totalRepos,
      icon: <FolderSpecialOutlinedIcon sx={{ color: "primary.main", fontSize: 24 }} />,
      color: "primary.main",
    },
    {
      label: "Stars",
      value: stats.totalStars,
      icon: <StarBorderRoundedIcon sx={{ color: "#E3B341", fontSize: 24 }} />,
      color: "#E3B341",
    },
    {
      label: "Open PRs",
      value: stats.totalOpenPRs,
      icon: <AltRouteIcon sx={{ color: "#0969DA", fontSize: 24 }} />,
      color: "#0969DA",
    },
    {
      label: "Open Issues",
      value: stats.totalOpenIssues,
      icon: <AdjustIcon sx={{ color: "error.main", fontSize: 24 }} />,
      color: "error.main",
    },
    {
      label: "Forks",
      value: stats.totalForks,
      icon: <FolderSpecialOutlinedIcon sx={{ color: "secondary.main", fontSize: 24 }} />,
      color: "secondary.main",
    },
    {
      label: "Followers",
      value: stats.followers,
      icon: <PeopleIcon sx={{ color: "#8957E5", fontSize: 24 }} />,
      color: "#8957E5",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {statItems.map((item, idx) => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {item.label}
              </Typography>
              {item.icon}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {formatNumber(item.value)}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
