"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 72, color: "text.secondary", mb: 2 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        404 — Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mb: 3 }}>
        The repository, pull request, or view you are looking for does not exist or may have been moved.
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="contained"
        color="primary"
        sx={{ borderRadius: 8, px: 3, textTransform: "none", fontWeight: 700 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}
