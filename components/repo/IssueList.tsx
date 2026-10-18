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
import AdjustIcon from "@mui/icons-material/Adjust";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LabelChip from "./LabelChip";
import StaleBadge from "./StaleBadge";
import EmptyState from "../shared/EmptyState";
import { Issue } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface IssueListProps {
  issues: Issue[];
}

type StateFilter = "all" | "open" | "closed";
type SortOption = "updated" | "newest" | "oldest" | "stalest" | "comments";

const PAGE_SIZE = 10;

export default function IssueList({ issues }: IssueListProps) {
  const [filter, setFilter] = useState<StateFilter>("open");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [page, setPage] = useState(1);

  // Reset page when filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [filter, sortBy]);

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        if (filter === "all") return true;
        return issue.state === filter;
      })
      .sort((a, b) => {
        if (sortBy === "stalest") return b.daysOpen - a.daysOpen;
        if (sortBy === "comments") return b.comments - a.comments;
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [issues, filter, sortBy]);

  const totalPages = Math.ceil(filteredIssues.length / PAGE_SIZE);
  const paginatedIssues = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredIssues.slice(start, start + PAGE_SIZE);
  }, [filteredIssues, page]);

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
            Open ({issues.filter((i) => i.state === "open").length})
          </Button>
          <Button
            variant={filter === "closed" ? "contained" : "outlined"}
            onClick={() => setFilter("closed")}
          >
            Closed ({issues.filter((i) => i.state === "closed").length})
          </Button>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
          >
            All ({issues.length})
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
      {filteredIssues.length === 0 ? (
        <EmptyState
          title={`No ${filter !== "all" ? filter : ""} issues found`}
          description="There are currently no issues matching this state filter."
        />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedIssues.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, filteredIssues.length)} of {filteredIssues.length} issues
            </Typography>
          </Box>

          <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {paginatedIssues.map((issue) => (
              <ListItem
                key={issue.number}
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
                  {issue.state === "open" ? (
                    <AdjustIcon sx={{ color: "error.main", fontSize: 20 }} />
                  ) : (
                    <CheckCircleIcon sx={{ color: "#8957E5", fontSize: 20 }} />
                  )}
                  <Avatar
                    src={issue.authorAvatar}
                    alt={issue.author}
                    sx={{ width: 26, height: 26 }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {issue.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{issue.number}
                    </Typography>
                    {issue.state === "open" && (
                      <StaleBadge category={issue.staleCategory} daysOpen={issue.daysOpen} />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="caption" color="text.secondary">
                      opened {timeAgo(issue.createdAt)} by <strong>{issue.author}</strong>
                    </Typography>
                    {issue.comments > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <ChatBubbleIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {issue.comments}
                        </Typography>
                      </Box>
                    )}
                    {issue.labels.map((l) => (
                      <LabelChip key={l.name} name={l.name} color={l.color} />
                    ))}
                  </Box>
                </Box>

                <Button
                  component="a"
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                >
                  View Issue
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
