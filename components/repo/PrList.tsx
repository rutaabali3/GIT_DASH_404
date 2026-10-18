"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Avatar,
  ButtonGroup,
  Button,
  FormControl,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LabelChip from "./LabelChip";
import StaleBadge from "./StaleBadge";
import EmptyState from "../shared/EmptyState";
import { PullRequest } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface PrListProps {
  prs: PullRequest[];
}

type StateFilter = "all" | "open" | "closed" | "merged";
type SortOption = "updated" | "newest" | "oldest" | "stalest" | "comments";

const PAGE_SIZE = 10;

export default function PrList({ prs }: PrListProps) {
  const [filter, setFilter] = useState<StateFilter>("open");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [page, setPage] = useState(1);

  // Reset page when filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [filter, sortBy]);

  const filteredPrs = useMemo(() => {
    return prs
      .filter((pr) => {
        if (filter === "all") return true;
        return pr.state === filter;
      })
      .sort((a, b) => {
        if (sortBy === "stalest") return b.daysOpen - a.daysOpen;
        if (sortBy === "comments") return (b.comments || 0) - (a.comments || 0);
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [prs, filter, sortBy]);

  const totalPages = Math.ceil(filteredPrs.length / PAGE_SIZE);
  const paginatedPrs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPrs.slice(start, start + PAGE_SIZE);
  }, [filteredPrs, page]);

  const getStateIcon = (state: "open" | "closed" | "merged") => {
    if (state === "merged") return <CallMergeIcon sx={{ color: "#8957E5", fontSize: 20 }} />;
    if (state === "closed") return <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />;
    return <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />;
  };

  return (
    <Box>
      {/* Filters & Sorting */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={filter === "open" ? "contained" : "outlined"}
            onClick={() => setFilter("open")}
          >
            Open ({prs.filter((p) => p.state === "open").length})
          </Button>
          <Button
            variant={filter === "merged" ? "contained" : "outlined"}
            onClick={() => setFilter("merged")}
          >
            Merged ({prs.filter((p) => p.state === "merged").length})
          </Button>
          <Button
            variant={filter === "closed" ? "contained" : "outlined"}
            onClick={() => setFilter("closed")}
          >
            Closed ({prs.filter((p) => p.state === "closed").length})
          </Button>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
          >
            All ({prs.length})
          </Button>
        </ButtonGroup>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            sx={{ height: 32, fontSize: "0.8rem" }}
          >
            <MenuItem value="updated">Recently Updated</MenuItem>
            <MenuItem value="stalest">Stalest First</MenuItem>
            <MenuItem value="comments">Most Comments</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List */}
      {filteredPrs.length === 0 ? (
        <EmptyState
          title={`No ${filter !== "all" ? filter : ""} pull requests found`}
          description="There are currently no pull requests matching this state filter."
        />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedPrs.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, filteredPrs.length)} of {filteredPrs.length} pull requests
            </Typography>
          </Box>

          <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {paginatedPrs.map((pr) => (
              <ListItem
                key={`${pr.repo || "repo"}#${pr.number}`}
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {getStateIcon(pr.state)}
                  <Avatar
                    src={pr.authorAvatar}
                    alt={pr.author}
                    sx={{ width: 26, height: 26 }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {pr.repo && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          bgcolor: "action.hover",
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 1,
                        }}
                      >
                        {pr.repo}
                      </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {pr.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{pr.number}
                    </Typography>
                    {pr.state === "open" && (
                      <StaleBadge category={pr.staleCategory} daysOpen={pr.daysOpen} />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="caption" color="text.secondary">
                      opened {timeAgo(pr.createdAt)} by <strong>{pr.author}</strong>
                    </Typography>
                    {pr.comments > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <ChatBubbleIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {pr.comments}
                        </Typography>
                      </Box>
                    )}
                    {pr.labels.map((l) => (
                      <LabelChip key={l.name} name={l.name} color={l.color} />
                    ))}
                  </Box>
                </Box>

                <Button
                  component="a"
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                >
                  View PR
                </Button>
              </ListItem>
            ))}
          </List>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => {
                  setPage(val);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
