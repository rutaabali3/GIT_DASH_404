"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StaleBadge from "../repo/StaleBadge";
import { StaleCategory } from "@/lib/types";

export interface StaleItem {
  id: string;
  repo: string;
  number: number;
  title: string;
  type: "PR" | "Issue";
  daysOpen: number;
  staleCategory: StaleCategory;
  url: string;
}

interface StaleCalloutsProps {
  items: StaleItem[];
}

export default function StaleCallouts({ items }: StaleCalloutsProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Group stale items by repository
  const groupedByRepo = useMemo(() => {
    const map = new Map<string, StaleItem[]>();
    for (const item of items) {
      const list = map.get(item.repo) || [];
      list.push(item);
      map.set(item.repo, list);
    }
    return Array.from(map.entries()).sort((a, b) => {
      // Sort repos by max days open
      const maxA = Math.max(...a[1].map((i) => i.daysOpen));
      const maxB = Math.max(...b[1].map((i) => i.daysOpen));
      return maxB - maxA;
    });
  }, [items]);

  if (!items || items.length === 0) return null;

  const count90 = items.filter((i) => i.staleCategory === "stale-90").length;
  const count60 = items.filter((i) => i.staleCategory === "stale-60").length;
  const count30 = items.filter((i) => i.staleCategory === "stale-30").length;

  const displayedGroups = showAll ? groupedByRepo : groupedByRepo.slice(0, 4);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 4,
        borderColor: count90 > 0 ? "error.main" : "warning.main",
        bgcolor: count90 > 0 ? "rgba(207, 34, 46, 0.04)" : "rgba(210, 153, 34, 0.04)",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <WarningAmberRoundedIcon
            sx={{
              color: count90 > 0 ? "error.main" : "warning.main",
              fontSize: 28,
            }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Items Needing Attention ({items.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open PRs and issues lingering across your repositories
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {count90 > 0 && (
            <Chip
              label={`${count90} > 90d`}
              size="small"
              sx={{ bgcolor: "error.main", color: "white", fontWeight: 700 }}
            />
          )}
          {count60 > 0 && (
            <Chip
              label={`${count60} > 60d`}
              size="small"
              sx={{ bgcolor: "#ED6C02", color: "white", fontWeight: 700 }}
            />
          )}
          {count30 > 0 && (
            <Chip
              label={`${count30} > 30d`}
              size="small"
              sx={{ bgcolor: "#F59E0B", color: "black", fontWeight: 700 }}
            />
          )}
          <IconButton size="small">
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, pt: 0 }}>
          {displayedGroups.map(([repoName, repoItems]) => (
            <Box key={repoName} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1, px: 0.5 }}>
                <FolderSpecialOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {repoName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({repoItems.length})
                </Typography>
              </Box>

              <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {repoItems.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      py: 1,
                      px: 1.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, overflow: "hidden" }}>
                      <Chip
                        label={item.type}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        #{item.number}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, alignSelf: { xs: "flex-end", sm: "center" } }}>
                      <StaleBadge category={item.staleCategory} daysOpen={item.daysOpen} />
                      <Button
                        component="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        sx={{ minWidth: "auto", px: 1 }}
                      >
                        View
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}

          {groupedByRepo.length > 4 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setShowAll(!showAll)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {showAll ? "Show Less" : `Show All Repositories (${groupedByRepo.length})`}
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
