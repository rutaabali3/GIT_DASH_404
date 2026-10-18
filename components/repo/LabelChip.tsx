"use client";

import React from "react";
import { Chip } from "@mui/material";
import { getContrastColor } from "@/lib/utils";

interface LabelChipProps {
  name: string;
  color: string;
  size?: "small" | "medium";
}

export default function LabelChip({ name, color, size = "small" }: LabelChipProps) {
  const bg = `#${color.replace("#", "")}`;
  const textColor = getContrastColor(bg);

  return (
    <Chip
      label={name}
      size={size}
      sx={{
        backgroundColor: bg,
        color: textColor,
        fontWeight: 600,
        fontSize: size === "small" ? "0.72rem" : "0.8rem",
        height: size === "small" ? 22 : 26,
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    />
  );
}
