# GIT-DASH — Personal GitHub Dashboard

> A single-user GitHub dashboard for managing and monitoring everything on your personal GitHub profile, powered by a Personal Access Token (PAT). Built with Next.js App Router, styled with **Material Design 3 (MD3)** by Google, deployed to Vercel.

---

## What This Is

A single pane of glass for **your** GitHub life — repos, pull requests, issues, commits, CI pipelines, traffic, followers, stars — all in one place instead of jumping between 15 GitHub tabs. You authenticate once with a fine-grained PAT stored as an env var, and the dashboard handles the rest.

## What This Is Not

- Not a GitHub clone — no code editing, no file browsing
- Not a team/org tool — everything is scoped to one user's profile
- Not a public SaaS — no auth flow, no billing, no multi-tenant anything

---

## Design System — Material Design 3

The entire UI follows [Material Design 3](https://m3.material.io/) principles and components.

### Core Setup

- **Component Library**: Use `@mui/material` v6+ with MD3 theming (`extendTheme` from `@mui/material/styles`)
- **Color System**: MD3 dynamic color — generate a full tonal palette from a single seed color (GitHub's `#24292e` or a user-chosen accent)
- **Typography**: MD3 type scale — Display, Headline, Title, Body, Label roles using `Roboto` or `Google Sans Text`
- **Shape**: MD3 shape system — small (8dp), medium (12dp), large (16dp), extra-large (28dp) corner radii
- **Elevation**: MD3 surface tint system (tonal elevation) instead of drop shadows
- **Motion**: MD3 easing and duration tokens — `emphasized`, `emphasizedDecelerate`, `emphasizedAccelerate`, `standard`

### Component Mapping

| Dashboard Element | MD3 Component |
|---|---|
| Stat strip (repos, stars, followers) | `Card` — filled variant, with `Icon` + `Typography` |
| Repo grid | `Card` — elevated variant, clickable with ripple |
| Navigation | `NavigationRail` (desktop) / `NavigationBar` (mobile) |
| Repo detail tabs | `Tabs` — secondary variant |
| PR/issue lists | `List` with `ListItem`, `Avatar`, `Chip` for labels |
| Stale badges | `Badge` or `Chip` — error/warning color roles |
| Filters/dropdowns | `Menu` + `FilterChip` |
| Search | `SearchBar` — MD3 search pattern |
| Loading states | `CircularProgress` + `Skeleton` |
| Empty states | MD3 empty-state pattern (illustration + headline + body) |
| Snackbars/toasts | `Snackbar` with MD3 styling |
| Dialogs (confirm close, etc.) | `Dialog` — full-screen on mobile, standard on desktop |
| Theme toggle | `Switch` — dark/light/auto |

### Responsive Behavior

- **Desktop (≥1200px)**: `NavigationRail` on the left, 3–4 column repo grid
- **Tablet (600–1199px)**: `NavigationRail` collapsed, 2 column grid
- **Mobile (<600px)**: `NavigationBar` at bottom, single column, full-screen dialogs

### Dark Mode

- MD3 dark color scheme generated from the same seed color
- Respects `prefers-color-scheme` by default, with manual toggle
- All surfaces use tonal elevation (surface + tint overlay), never pure black

---

## Architecture

```
GIT-DASH/
├── app/
│   ├── layout.tsx              # Root layout — MD3 ThemeProvider, NavigationRail
│   ├── page.tsx                # / — Overview dashboard
│   ├── repo/
│   │   └── [owner]/
│   │       └── [name]/
│   │           ├── page.tsx    # Repo overview tab
│   │           ├── prs/
│   │           │   └── page.tsx
│   │           ├── issues/
│   │           │   └── page.tsx
│   │           ├── commits/
│   │           │   └── page.tsx
│   │           ├── ci/            # v2
│   │           │   └── page.tsx
│   │           └── traffic/       # v3
│   │               └── page.tsx
│   └── api/
│       ├── user/
│       │   └── [username]/
│       │       └── route.ts       # User profile + aggregate stats
│       ├── repos/
│       │   └── route.ts           # List repos + stats
│       └── repo/
│           └── [owner]/
│               └── [name]/
│                   ├── route.ts       # Single repo overview
│                   ├── prs/
│                   │   └── route.ts
│                   ├── issues/
│                   │   └── route.ts
│                   ├── commits/
│                   │   └── route.ts
│                   ├── workflows/     # v2
│                   │   └── route.ts
│                   ├── languages/     # v2
│                   │   └── route.ts
│                   ├── contributors/  # v2
│                   │   └── route.ts
│                   └── traffic/       # v3
│                       └── route.ts
├── lib/
│   ├── github.ts              # Octokit client (reads GITHUB_TOKEN)
│   ├── cache.ts               # Next.js revalidate wrapper
│   ├── types.ts               # Shared TypeScript types
│   ├── stale.ts               # Stale PR/issue logic
│   └── utils.ts               # Date formatting, number abbreviation, etc.
├── components/
│   ├── theme/
│   │   ├── ThemeProvider.tsx   # MD3 theme setup + dark mode
│   │   └── tokens.ts          # MD3 color/shape/motion tokens
│   ├── layout/
│   │   ├── AppShell.tsx        # NavigationRail + content area
│   │   ├── NavigationRail.tsx
│   │   └── NavigationBar.tsx
│   ├── dashboard/
│   │   ├── StatStrip.tsx       # Overview stat cards
│   │   ├── RepoGrid.tsx       # Repo card grid
│   │   ├── RepoCard.tsx       # Individual repo card
│   │   └── StaleCallouts.tsx  # Stale PR/issue summary
│   ├── repo/
│   │   ├── RepoHeader.tsx
│   │   ├── RepoTabs.tsx
│   │   ├── PrList.tsx
│   │   ├── IssueList.tsx
│   │   ├── CommitList.tsx
│   │   ├── LabelChip.tsx      # GitHub label with real colors
│   │   └── StaleBadge.tsx     # 30/60/90 day badges
│   └── shared/
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── LoadingSkeleton.tsx
│       └── TimeAgo.tsx
├── .env.example
├── .env.local                 # (gitignored) GITHUB_TOKEN=ghp_...
├── next.config.ts
├── package.json
├── tsconfig.json
├── LICENSE                    # MIT
└── README.md
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router | Frontend + API in one deploy |
| Hosting | Vercel | Zero-config for Next.js |
| GitHub client | Octokit (`@octokit/rest`) | Official SDK, typed |
| UI library | `@mui/material` v6 | Best MD3 implementation for React |
| Icons | `@mui/icons-material` + Material Symbols | Native MD3 icon set |
| Caching | Next.js `revalidate` in route handlers | No extra infra for v1 |
| Database (v1–v2) | None | All data is live from GitHub API |
| Database (v3) | Vercel Postgres or JSON snapshot | Only for time-series data GitHub doesn't retain |
| Auth | PAT as env var | Single user, no login needed |

### Caching Strategy

| Data | Revalidate Interval | Rationale |
|---|---|---|
| Repo list | 60 seconds | Repos rarely change |
| Single repo stats | 30 seconds | PRs/issues can change frequently |
| PR / issue list | 30 seconds | Active collaboration data |
| Commit history | 120 seconds | Historical, rarely changes retroactively |
| User profile | 300 seconds | Followers/bio almost never change |
| CI runs (v2) | 30 seconds | Want near-live pipeline status |
| Traffic (v3) | 3600 seconds | GitHub aggregates daily anyway |

---

## API Data Shapes

### `GET /api/user/[username]`

```typescript
interface UserProfile {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  totalStars: number;        // aggregated across all repos
  followers: number;
  following: number;
  openIssues: number;        // aggregated across all repos
  openPRs: number;           // aggregated across all repos
  profileUrl: string;
}
```

### `GET /api/repos?username=...`

```typescript
interface RepoSummary {
  owner: string;
  name: string;
  fullName: string;          // "owner/name"
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;        // GitHub's combined issues+PRs count
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  updatedAt: string;         // ISO 8601
  pushedAt: string;          // ISO 8601
  url: string;
}

interface ReposResponse {
  repos: RepoSummary[];
  stats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalOpenIssues: number;
  };
}
```

### `GET /api/repo/[owner]/[name]/prs`

```typescript
interface PullRequest {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  labels: Label[];
  staleCategory: "fresh" | "stale-30" | "stale-60" | "stale-90" | null;
  daysOpen: number;
  additions: number;
  deletions: number;
  comments: number;
  reviewStatus: string | null;  // v2 — "approved" | "changes_requested" | "pending"
  url: string;
}

interface Label {
  name: string;
  color: string;             // hex without #, e.g. "e4e669"
  description: string | null;
}
```

### `GET /api/repo/[owner]/[name]/issues`

```typescript
interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  labels: Label[];
  staleCategory: "fresh" | "stale-30" | "stale-60" | "stale-90" | null;
  daysOpen: number;
  comments: number;
  isPullRequest: boolean;    // GitHub API includes PRs in issues — filter these out
  url: string;
}
```

### `GET /api/repo/[owner]/[name]/commits`

```typescript
interface Commit {
  sha: string;
  shortSha: string;          // first 7 chars
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  additions: number;
  deletions: number;
  url: string;
}
```

---

## Stale Flagging Logic

This is the highest value-per-effort feature in v1. It costs zero extra API calls since the data already comes back with every PR/issue fetch.

### Rules

```typescript
// lib/stale.ts

type StaleCategory = "fresh" | "stale-30" | "stale-60" | "stale-90";

function categorizeStale(createdAt: string, state: string): StaleCategory | null {
  if (state !== "open") return null; // only flag open items

  const daysOpen = daysSince(createdAt);

  if (daysOpen >= 90) return "stale-90";
  if (daysOpen >= 60) return "stale-60";
  if (daysOpen >= 30) return "stale-30";
  return "fresh";
}
```

### Visual Treatment (MD3)

| Category | MD3 Color Role | Badge Text | Chip Variant |
|---|---|---|---|
| `fresh` | No badge | — | — |
| `stale-30` | `tertiaryContainer` | "30+ days" | Tonal chip |
| `stale-60` | `secondaryContainer` | "60+ days" | Tonal chip, bolder |
| `stale-90` | `errorContainer` | "90+ days" | Filled chip, error |

### Dashboard Callouts

The overview page (`/`) shows a "Needs Attention" section:

- **MD3 Card** (filled, error container color) if any items are 90+ days stale
- Groups stale items by repo
- Each item links directly to the PR/issue detail on GitHub
- Shows total count per stale tier as `FilterChip` pills

---

## Build Order — Detailed Phase Breakdown

> [!IMPORTANT]
> Each phase is self-contained. Complete and verify one phase before starting the next. No speculative code for future phases.

---

### Phase 1 — Project Scaffold + MD3 Theme

**Goal**: Empty app that runs, looks correct, has the navigation shell.

#### Steps

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest git-dash --typescript --tailwind --eslint --app --src-dir=false
   ```
   - Remove default Tailwind styles (we're using MUI, Tailwind only for utility if needed)
   - Install: `@mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/cache`

2. **MD3 Theme setup**
   - Create `components/theme/tokens.ts` — seed color, generate tonal palette
   - Create `components/theme/ThemeProvider.tsx` — light/dark schemes, `CssBaseline`
   - Wire into `app/layout.tsx`

3. **App shell**
   - Create `components/layout/AppShell.tsx` — responsive container
   - Create `components/layout/NavigationRail.tsx` — desktop sidebar with icons: Home, Repos
   - Create `components/layout/NavigationBar.tsx` — mobile bottom bar
   - Dark mode toggle in the rail/bar

4. **Placeholder pages**
   - `app/page.tsx` — "Dashboard" heading, empty
   - `app/repo/[owner]/[name]/page.tsx` — "Repo Detail" heading, empty

5. **Static files**
   - `.env.example` with `GITHUB_TOKEN=ghp_your_token_here`
   - `LICENSE` (MIT)
   - `README.md` — project description, setup instructions, deploy guide

#### Verify

- `npm run dev` — app loads, NavigationRail visible on desktop, NavigationBar on mobile
- Dark mode toggle works
- MD3 color scheme is consistent across all surfaces
- No console errors

---

### Phase 2 — GitHub Client + API Routes

**Goal**: All API routes return real data from GitHub. No UI yet — test with curl/browser.

#### Steps

1. **GitHub client**
   - Create `lib/github.ts` — instantiate `Octokit` from `GITHUB_TOKEN` env var
   - Export typed helper functions: `getUser()`, `getRepos()`, `getRepoPRs()`, `getRepoIssues()`, `getRepoCommits()`

2. **Types**
   - Create `lib/types.ts` — all interfaces from the "API Data Shapes" section above

3. **Cache wrapper**
   - Create `lib/cache.ts` — export `revalidate` constants per data type
   - Each route handler uses `export const revalidate = CACHE.REPO_LIST` (or equivalent)

4. **Stale logic**
   - Create `lib/stale.ts` — `categorizeStale()` function, `daysSince()` helper

5. **Utility helpers**
   - Create `lib/utils.ts` — `formatNumber()` (1200 → "1.2k"), `formatDate()`, `timeAgo()`

6. **API routes** (each is a `route.ts` with `GET` handler)
   - `app/api/user/[username]/route.ts` — fetch user profile + aggregate star count across repos
   - `app/api/repos/route.ts` — fetch all repos for `?username=`, return `ReposResponse`
   - `app/api/repo/[owner]/[name]/prs/route.ts` — fetch open+closed PRs, attach stale category
   - `app/api/repo/[owner]/[name]/issues/route.ts` — fetch issues, **filter out PRs** (GitHub includes them), attach stale category
   - `app/api/repo/[owner]/[name]/commits/route.ts` — fetch recent commits (last 30)

#### Verify

- Hit each `/api/...` route in the browser — valid JSON, correct shapes
- Stale categories are correct (check against actual PR ages)
- Issues response does NOT include pull requests
- Caching works — second request within revalidate window is faster
- Missing `GITHUB_TOKEN` returns a clear 500 error, not a crash

---

### Phase 3 — Overview Dashboard UI

**Goal**: The `/` page is fully functional with live data.

#### Steps

1. **Stat strip component**
   - `components/dashboard/StatStrip.tsx` — row of MD3 filled cards
   - Stats: Total Repos, Total Stars, Open Issues, Open PRs, Followers
   - Each card: MD3 `Icon` + count (formatted with `formatNumber()`) + label
   - Responsive: horizontal scroll on mobile, grid on desktop

2. **Repo card component**
   - `components/dashboard/RepoCard.tsx` — MD3 elevated card
   - Shows: name, description (truncated 2 lines), primary language (colored dot), stars, forks, last updated (timeAgo)
   - Stale indicator if repo has any stale issues/PRs (small error-colored dot)
   - Click navigates to `/repo/[owner]/[name]`

3. **Repo grid**
   - `components/dashboard/RepoGrid.tsx` — responsive grid of `RepoCard`
   - Sort options (MD3 `FilterChip` group): Most stars, Recently updated, Most issues, Name A–Z
   - Filter chips: Hide archived, Hide forks, Language filter
   - `LoadingSkeleton` while fetching
   - `EmptyState` if no repos match filters

4. **Stale callouts section**
   - `components/dashboard/StaleCallouts.tsx` — "Needs Attention" section
   - MD3 card with `errorContainer` color for 90+ day items
   - Grouped by repo, each item is a clickable `ListItem`
   - Summary chips: "3 items 90+ days", "7 items 60+ days", "12 items 30+ days"
   - Collapsible per repo (MD3 `Accordion` / `ExpansionPanel`)

5. **Wire it all together**
   - `app/page.tsx` — fetch data from API routes (server components or client with SWR)
   - Stat strip at top → Stale callouts → Repo grid
   - Loading states for each section independently

#### Verify

- Page loads with real data from your GitHub profile
- Stat numbers match what GitHub shows on your profile
- Repo cards display correctly — language dots, star counts, timeAgo
- Sort and filter chips work
- Stale callouts show the right items in the right tiers
- Responsive: looks correct on mobile, tablet, desktop
- Dark mode: all components render correctly

---

### Phase 4 — Repo Detail Pages

**Goal**: `/repo/[owner]/[name]` is fully functional with tabbed navigation.

#### Steps

1. **Repo header**
   - `components/repo/RepoHeader.tsx` — repo name, description, language, stars, forks, link to GitHub
   - MD3 `TopAppBar` pattern with back navigation

2. **Tab navigation**
   - `components/repo/RepoTabs.tsx` — MD3 secondary tabs
   - Tabs: Overview, Pull Requests, Issues, Commits
   - Each tab is a nested route under `/repo/[owner]/[name]/`

3. **Overview tab** (`app/repo/[owner]/[name]/page.tsx`)
   - Mini stat cards: open PRs, open issues, recent commits (last 7 days)
   - Stale summary for this repo only
   - Recent activity list (last 5 PRs + issues + commits, merged and sorted by date)

4. **Pull Requests tab** (`app/repo/[owner]/[name]/prs/page.tsx`)
   - `components/repo/PrList.tsx` — MD3 `List`
   - Each item: PR number, title, author avatar, timeAgo, labels (as `LabelChip` with real colors), stale badge
   - `components/repo/LabelChip.tsx` — renders GitHub label with actual hex color as background, auto-contrasted text
   - `components/repo/StaleBadge.tsx` — MD3 chip with appropriate color role
   - Filter: Open / Closed / All (MD3 `SegmentedButton`)
   - Sort: Newest, Oldest, Most commented, Stalest first

5. **Issues tab** (`app/repo/[owner]/[name]/issues/page.tsx`)
   - `components/repo/IssueList.tsx` — same layout pattern as PR list
   - Same filtering and sorting
   - Same label and stale badge components

6. **Commits tab** (`app/repo/[owner]/[name]/commits/page.tsx`)
   - `components/repo/CommitList.tsx` — MD3 `List`
   - Each item: short SHA (monospace), commit message (truncated), author, date, +/- line counts
   - Grouped by date (today, yesterday, this week, older)

7. **Shared components**
   - `components/shared/EmptyState.tsx` — MD3 pattern: illustration + headline + body
   - `components/shared/ErrorState.tsx` — error recovery with retry button
   - `components/shared/LoadingSkeleton.tsx` — skeleton that matches the shape of each list
   - `components/shared/TimeAgo.tsx` — relative time display

#### Verify

- Navigate from overview dashboard to any repo — tabs load correctly
- PR list shows real PRs with correct labels (match colors against GitHub)
- Issue list correctly excludes pull requests
- Stale badges show on the correct items
- Commit list grouped by date
- All filters and sorts work
- Back navigation returns to overview
- Deep linking works — direct URL to `/repo/owner/name/prs` loads correctly

---

### Phase 5 — Polish + Open-Source Prep (still v1)

**Goal**: Production-ready, deployable, documented.

#### Steps

1. **Error handling**
   - Global error boundary (`app/error.tsx`) — MD3 error state
   - API route error responses — consistent shape: `{ error: string, status: number }`
   - Handle GitHub API rate limiting gracefully — show "Rate limited, retry in X seconds" toast
   - Handle missing/invalid PAT — clear error on first load

2. **Loading experience**
   - Skeleton screens for every data-dependent section
   - `Suspense` boundaries around each independent section
   - No layout shift when data loads

3. **SEO + metadata**
   - `app/layout.tsx` — title, description, Open Graph tags
   - Favicon (GitHub-dashboard themed)

4. **README.md** — comprehensive
   - What it is, screenshots
   - Prerequisites (Node 18+, GitHub PAT)
   - How to get a fine-grained PAT (step by step with required permissions)
   - Local development (`npm install` → `.env.local` → `npm run dev`)
   - Deploy to Vercel (one-click or CLI)
   - Architecture overview
   - Feature roadmap (v2–v4 bullets)

5. **Environment**
   - `.env.example` — documented
   - `next.config.ts` — image domains for GitHub avatars
   - Verify `npm run build` succeeds with no warnings

#### Verify

- `npm run build` — zero errors, zero warnings
- Deploy to Vercel preview — everything works
- Hit rate limit intentionally (or mock it) — graceful handling
- Remove `GITHUB_TOKEN` — clear error message, not a crash
- README is self-sufficient — someone else can clone and deploy

---

### Phase 6 — CI Status + Languages (v2)

**Goal**: New CI tab, languages breakdown, review status on PRs, contributors.

#### Steps

1. **New API routes**
   - `app/api/repo/[owner]/[name]/workflows/route.ts` — fetch workflow runs from GitHub Actions API
   - `app/api/repo/[owner]/[name]/languages/route.ts` — fetch language breakdown (bytes → percentage)
   - `app/api/repo/[owner]/[name]/contributors/route.ts` — fetch top contributors

2. **Data shapes**

   ```typescript
   interface WorkflowRun {
     id: number;
     name: string;                // workflow name
     status: "completed" | "in_progress" | "queued";
     conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
     branch: string;
     commit: string;              // short SHA
     duration: number;            // seconds
     startedAt: string;
     completedAt: string | null;
     url: string;                 // link to GitHub Actions logs
   }

   interface LanguageBreakdown {
     language: string;
     bytes: number;
     percentage: number;          // 0–100
     color: string;               // GitHub's language color
   }

   interface Contributor {
     username: string;
     avatarUrl: string;
     contributions: number;       // commit count
     profileUrl: string;
   }
   ```

3. **CI tab** (`app/repo/[owner]/[name]/ci/page.tsx`)
   - Table of recent workflow runs — MD3 `DataTable` or styled `List`
   - Status indicator: green check (success), red X (failure), yellow spinner (in progress), gray dash (skipped/cancelled)
   - Duration formatted ("2m 34s")
   - Branch name as `Chip`
   - Link to full logs on GitHub
   - Filter by workflow name, branch

4. **Languages section** — add to repo overview tab
   - Horizontal stacked bar (MD3 colors from language palette)
   - Legend below with language name + percentage
   - Use GitHub's official language colors

5. **Review status on PRs** — enhance existing PR list
   - Add review status chip: ✅ Approved (green), 🔄 Changes Requested (orange), ⏳ Pending (gray)
   - Fetch from PR review API

6. **Contributors section** — add to repo overview tab
   - Grid of `Avatar` + username + commit count
   - Top 10, with "View all" link to GitHub

7. **Update NavigationRail**
   - Add repo-level tab for CI in the tab bar

#### Verify

- CI tab shows real workflow runs with correct statuses
- Language bar percentages sum to 100%
- PR review status matches what GitHub shows
- Contributors list is accurate
- Repos with no CI show an appropriate empty state ("No workflows configured")

---

### Phase 7 — Traffic, Snapshots, History (v3)

**Goal**: Time-series data that GitHub doesn't retain. Requires storage + a cron job.

> [!WARNING]
> This phase introduces infrastructure beyond just the Next.js app. Plan the storage solution before writing code.

#### Storage Decision

Choose one:

| Option | Pros | Cons |
|---|---|---|
| **Vercel Postgres** | Real DB, SQL queries, built-in | Costs money at scale, vendor lock-in |
| **GitHub Action → JSON file** | Free, data lives in the repo, version history | Slower reads, no queries, commit noise |
| **Vercel KV (Redis)** | Fast, simple key-value | Less flexible for time-series queries |

**Recommended**: Vercel Postgres for structured time-series data, unless staying fully free matters — then use the JSON snapshot approach.

#### Steps

1. **Snapshot cron job** — set this up FIRST, even before the UI
   - GitHub Action that runs daily at midnight UTC
   - Fetches: star count, follower count, repo view/clone counts (14-day window)
   - Writes to storage (DB rows or JSON append)
   - This needs to run for days/weeks before the charts have meaningful data

2. **New API routes**
   - `app/api/repo/[owner]/[name]/traffic/route.ts` — views, clones, referrers, popular paths
   - `app/api/user/[username]/history/route.ts` — star/follower history from snapshots
   - `app/api/user/[username]/events/route.ts` — recent activity feed

3. **Data shapes**

   ```typescript
   interface TrafficData {
     views: { timestamp: string; count: number; uniques: number }[];
     clones: { timestamp: string; count: number; uniques: number }[];
     referrers: { referrer: string; count: number; uniques: number }[];
     popularPaths: { path: string; title: string; count: number; uniques: number }[];
   }

   interface HistorySnapshot {
     date: string;               // YYYY-MM-DD
     stars: number;
     followers: number;
     publicRepos: number;
   }

   interface UserEvent {
     type: "star" | "fork" | "create" | "push" | "issue" | "pr";
     repo: string;
     description: string;
     date: string;
     url: string;
   }
   ```

4. **Traffic tab** (`app/repo/[owner]/[name]/traffic/page.tsx`)
   - Line charts for views and clones over 14 days (use `recharts` or `@nivo/line`)
   - Style charts with MD3 color tokens
   - Referrers table
   - Popular content table
   - Note: only works for repos you own — show clear message for non-owned repos

5. **History charts on overview**
   - Star history line chart (from snapshots)
   - Follower growth line chart (from snapshots)
   - "Started tracking on [date]" note if history is short

6. **Activity feed on overview**
   - Chronological list of recent events (stars given, repos created, forks, etc.)
   - MD3 `Timeline` pattern or `List` with event-type icons

7. **Contribution heatmap**
   - GitHub-style green squares grid
   - Fetch from GitHub's contribution data (scrape or GraphQL)
   - MD3 tonal color scale instead of GitHub green

#### Verify

- Cron job runs successfully and writes snapshot data
- Traffic charts render with real 14-day data
- History charts show accumulated snapshots
- Activity feed shows recent events
- Non-owned repos show "Traffic data unavailable" instead of errors

---

## Environment Variables

```env
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## PAT Permissions Guide (for README)

When creating a fine-grained Personal Access Token:

| Permission | Access Level | Required For |
|---|---|---|
| **Metadata** | Read | Basic repo info, user profile |
| **Issues** | Read | Issues list, labels |
| **Pull requests** | Read | PR list, review status |
| **Contents** | Read | Commit history |
| **Actions** | Read | CI/workflow runs (v2) |
| **Administration** | Read | Traffic data (v3, owned repos only) |

> [!TIP]
> Use a fine-grained token scoped to only your own repos. Classic tokens with `repo` scope work too but grant more access than needed.
