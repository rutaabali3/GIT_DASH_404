"use client";

import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Something Went Wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
        {error.message || "An unexpected error occurred while rendering the dashboard."}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => reset()} sx={{ borderRadius: 8, px: 3 }}>
        Try Again
      </Button>
    </Box>
  );
}
