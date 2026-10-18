"use client";

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useColorMode } from "../theme/ThemeRegistry";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RAIL_WIDTH = 80;

export default function NavigationRail() {
  const { resolvedMode, toggleTheme } = useColorMode();
  const pathname = usePathname();

  const isRepoPage = pathname.startsWith("/repo/");

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: <DashboardOutlinedIcon />,
      active: pathname === "/",
    },
    {
      label: "PRs",
      href: "/prs",
      icon: <AltRouteIcon />,
      active: pathname.startsWith("/prs"),
    },
    ...(isRepoPage
      ? [
          {
            label: "Repo",
            href: pathname,
            icon: <FolderSpecialOutlinedIcon />,
            active: true,
          },
        ]
      : []),
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": {
          width: RAIL_WIDTH,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 3,
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Brand Icon */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <IconButton
          component={Link}
          href="/"
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
            width: 44,
            height: 44,
            borderRadius: "16px",
          }}
        >
          <GitHubIcon />
        </IconButton>
        <Typography
          variant="caption"
          sx={{ mt: 0.8, fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.05em" }}
        >
          GIT-DASH
        </Typography>
      </Box>

      {/* Primary Navigation */}
      <List sx={{ width: "100%", px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
            <Tooltip title={item.label} placement="right">
              <ListItemButton
                component={Link}
                href={item.href}
                selected={item.active}
                sx={{
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: "16px",
                  py: 1,
                  px: 0.5,
                  minHeight: 56,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: "unset", mb: 0.5, color: "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <Typography variant="caption" sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Theme Toggle at bottom */}
      <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Tooltip title={resolvedMode === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ borderRadius: "12px" }}>
            {resolvedMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
