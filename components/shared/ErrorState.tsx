"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Failed to load GitHub data. Check your connection or Personal Access Token.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "error.main",
      }}
    >
      <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Unable to Load Data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 3 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
