"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Chip,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RepoCard from "./RepoCard";
import EmptyState from "../shared/EmptyState";
import { RepoSummary } from "@/lib/types";

interface RepoGridProps {
  repos: RepoSummary[];
}

type SortOption = "updated" | "stars" | "issues" | "name";

const PAGE_SIZE = 10;

export default function RepoGrid({ repos }: RepoGridProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [hideArchived, setHideArchived] = useState(false);
  const [hideForks, setHideForks] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Extract distinct languages
  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repos]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, hideArchived, hideForks, selectedLang]);

  // Filter and sort repos
  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        if (hideArchived && r.isArchived) return false;
        if (hideForks && r.isFork) return false;
        if (selectedLang && r.language !== selectedLang) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q) || false;
          return matchName || matchDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "issues") return b.openIssues - a.openIssues;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      });
  }, [repos, search, sortBy, hideArchived, hideForks, selectedLang]);

  // Paginated items (first 10, then next 10, etc.)
  const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE);
  const paginatedRepos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRepos.slice(start, start + PAGE_SIZE);
  }, [filteredRepos, page]);

  return (
    <Box>
      {/* Control bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          mb: 3,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Filter repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Sort & Quick Filter Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip
            label="Hide Forks"
            clickable
            color={hideForks ? "primary" : "default"}
            variant={hideForks ? "filled" : "outlined"}
            onClick={() => setHideForks(!hideForks)}
            size="small"
          />
          <Chip
            label="Hide Archived"
            clickable
            color={hideArchived ? "primary" : "default"}
            variant={hideArchived ? "filled" : "outlined"}
            onClick={() => setHideArchived(!hideArchived)}
            size="small"
          />

          {languages.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedLang || "all"}
                onChange={(e) => setSelectedLang(e.target.value === "all" ? null : e.target.value)}
                sx={{ height: 32, fontSize: "0.8rem" }}
              >
                <MenuItem value="all">All Languages</MenuItem>
                {languages.map((l) => (
                  <MenuItem key={l} value={l} sx={{ fontSize: "0.8rem" }}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              sx={{ height: 32, fontSize: "0.8rem" }}
            >
              <MenuItem value="updated" sx={{ fontSize: "0.8rem" }}>
                Recently Updated
              </MenuItem>
              <MenuItem value="stars" sx={{ fontSize: "0.8rem" }}>
                Most Stars
              </MenuItem>
              <MenuItem value="issues" sx={{ fontSize: "0.8rem" }}>
                Most Issues
              </MenuItem>
              <MenuItem value="name" sx={{ fontSize: "0.8rem" }}>
                Name (A-Z)
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Repositories count indicator */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedRepos.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
          {Math.min(page * PAGE_SIZE, filteredRepos.length)} of {filteredRepos.length} repositories
        </Typography>
      </Box>

      {/* Grid */}
      {filteredRepos.length === 0 ? (
        <EmptyState
          title="No repositories match your filter"
          description="Try clearing search keywords or filter pills to see your repositories."
        />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {paginatedRepos.map((repo) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={repo.fullName}>
                <RepoCard repo={repo} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => {
                  setPage(val);
                  window.scrollTo({ top: 320, behavior: "smooth" });
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
