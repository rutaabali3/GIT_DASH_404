"use client";

import React, { useMemo } from "react";
import { Box, Typography, List, ListItem, Avatar, Button } from "@mui/material";
import CommitIcon from "@mui/icons-material/Commit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EmptyState from "../shared/EmptyState";
import { Commit } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface CommitListProps {
  commits: Commit[];
}

function getDateCategory(dateString: string): string {
  const commitDate = new Date(dateString);
  const now = new Date();

  // Reset to midnight for day comparison
  const commitMidnight = new Date(commitDate.getFullYear(), commitDate.getMonth(), commitDate.getDate());
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((todayMidnight.getTime() - commitMidnight.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  if (diffDays < 30) return "This Month";
  return "Older";
}

export default function CommitList({ commits }: CommitListProps) {
  const groupedCommits = useMemo(() => {
    const order = ["Today", "Yesterday", "This Week", "This Month", "Older"];
    const map = new Map<string, Commit[]>();

    for (const commit of commits) {
      const cat = getDateCategory(commit.date);
      const list = map.get(cat) || [];
      list.push(commit);
      map.set(cat, list);
    }

    return order
      .filter((cat) => map.has(cat))
      .map((cat) => ({
        category: cat,
        items: map.get(cat)!,
      }));
  }, [commits]);

  if (commits.length === 0) {
    return (
      <EmptyState
        title="No commits found"
        description="No recent commits were returned for this repository."
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {groupedCommits.map(({ category, items }) => (
        <Box key={category}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: "0.08em",
              px: 0.5,
              mb: 1,
              display: "block",
            }}
          >
            {category} ({items.length})
          </Typography>

          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.map((commit) => (
              <ListItem
                key={commit.sha}
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CommitIcon sx={{ color: "primary.main", fontSize: 22 }} />
                  <Avatar
                    src={commit.authorAvatar}
                    alt={commit.author}
                    sx={{ width: 26, height: 26 }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {commit.message.split("\n")[0]}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>{commit.author}</strong> committed {timeAgo(commit.date)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: "action.hover",
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {commit.shortSha}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  component="a"
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                >
                  Commit
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}
