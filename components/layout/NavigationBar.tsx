"use client";

import React from "react";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "../theme/ThemeRegistry";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationBar() {
  const { resolvedMode, toggleTheme } = useColorMode();
  const pathname = usePathname();

  const isRepoPage = pathname.startsWith("/repo/");

  const getValue = () => {
    if (pathname === "/") return 0;
    if (pathname.startsWith("/prs")) return 1;
    if (isRepoPage) return 2;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: "block", sm: "none" },
        borderTop: "1px solid",
        borderColor: "divider",
      }}
      elevation={3}
    >
      <BottomNavigation value={getValue()} showLabels>
        <BottomNavigationAction
          label="Dashboard"
          icon={<DashboardOutlinedIcon />}
          component={Link}
          href="/"
        />
        <BottomNavigationAction
          label="PRs"
          icon={<AltRouteIcon />}
          component={Link}
          href="/prs"
        />
        {isRepoPage && (
          <BottomNavigationAction
            label="Repo"
            icon={<FolderSpecialOutlinedIcon />}
            component={Link}
            href={pathname}
          />
        )}
        <BottomNavigationAction
          label={resolvedMode === "dark" ? "Light" : "Dark"}
          icon={resolvedMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          onClick={toggleTheme}
        />
      </BottomNavigation>
    </Paper>
  );
}
