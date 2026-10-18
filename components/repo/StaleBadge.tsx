"use client";

import React from "react";
import { Chip } from "@mui/material";
import { StaleCategory } from "@/lib/types";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface StaleBadgeProps {
  category: StaleCategory;
  daysOpen?: number;
}

export default function StaleBadge({ category, daysOpen }: StaleBadgeProps) {
  if (category === "fresh") return null;

  let label = "30+ days";
  let bgcolor = "warning.light";
  let color = "warning.contrastText";

  if (category === "stale-90") {
    label = daysOpen ? `${daysOpen}d stale (90+)` : "90+ days";
    bgcolor = "error.main";
    color = "error.contrastText";
  } else if (category === "stale-60") {
    label = daysOpen ? `${daysOpen}d stale (60+)` : "60+ days";
    bgcolor = "#ED6C02";
    color = "#FFFFFF";
  } else if (category === "stale-30") {
    label = daysOpen ? `${daysOpen}d stale (30+)` : "30+ days";
    bgcolor = "#F59E0B";
    color = "#000000";
  }

  return (
    <Chip
      icon={<AccessTimeIcon style={{ color: "inherit", fontSize: "0.9rem" }} />}
      label={label}
      size="small"
      sx={{
        bgcolor,
        color,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 22,
      }}
    />
  );
}
