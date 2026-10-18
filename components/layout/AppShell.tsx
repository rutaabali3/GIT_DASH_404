"use client";

import React from "react";
import { Box } from "@mui/material";
import NavigationRail from "./NavigationRail";
import NavigationBar from "./NavigationBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <NavigationRail />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 9, sm: 4 }, // Extra padding on mobile for bottom navigation
          maxWidth: "1400px",
          mx: "auto",
          width: "100%",
        }}
      >
        {children}
      </Box>
      <NavigationBar />
    </Box>
  );
}
