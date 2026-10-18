"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { md3Tokens } from "./tokens";

type ThemeMode = "light" | "dark" | "system";

interface ColorModeContextType {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: "dark",
  resolvedMode: "dark",
  setMode: () => {},
  toggleTheme: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(true);

  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  useEffect(() => {
    const saved = localStorage.getItem("gitdash-theme-mode") as ThemeMode | null;
    if (saved) {
      setMode(saved);
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("gitdash-theme-mode", newMode);
  };

  const toggleTheme = () => {
    handleSetMode(resolvedMode === "dark" ? "light" : "dark");
  };

  const resolvedMode = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  const theme = useMemo(() => {
    const c = resolvedMode === "dark" ? md3Tokens.dark : md3Tokens.light;
    return createTheme({
      palette: {
        mode: resolvedMode,
        primary: {
          main: c.primary,
          contrastText: c.onPrimary,
        },
        secondary: {
          main: c.secondary,
          contrastText: c.onSecondary,
        },
        error: {
          main: c.error,
          contrastText: c.onError,
        },
        background: {
          default: c.background,
          paper: c.surface,
        },
        text: {
          primary: c.onSurface,
          secondary: c.onSurfaceVariant,
        },
        divider: c.outline,
      },
      shape: {
        borderRadius: md3Tokens.shape.md,
      },
      typography: {
        fontFamily: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        h1: { fontWeight: 600 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: md3Tokens.shape.lg,
              border: `1px solid ${c.outline}`,
              backgroundColor: c.surface,
              boxShadow: "none",
              transition: "all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0)",
              "&:hover": {
                borderColor: c.primary,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: md3Tokens.shape.xl,
              boxShadow: "none",
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: md3Tokens.shape.sm,
              fontWeight: 500,
            },
          },
        },
      },
    });
  }, [resolvedMode]);

  return (
    <CacheProvider value={cache}>
      <ColorModeContext.Provider value={{ mode, resolvedMode, setMode: handleSetMode, toggleTheme }}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </ColorModeContext.Provider>
    </CacheProvider>
  );
}
