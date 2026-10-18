"use client";

import React from "react";
import { Box, Skeleton, Grid, Card } from "@mui/material";

export function StatStripSkeleton() {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function RepoGridSkeleton() {
  return (
    <Grid container spacing={2.5}>
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={idx}>
          <Card variant="outlined" sx={{ p: 2.5, height: 180, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width="50%" height={28} />
            </Box>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="70%" sx={{ mb: "auto" }} />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Skeleton variant="text" width={60} />
              <Skeleton variant="text" width={50} />
              <Skeleton variant="text" width={80} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} variant="outlined" sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={26} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}
