import type { Metadata } from "next";
import ThemeRegistry from "@/components/theme/ThemeRegistry";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIT-DASH — Personal GitHub Dashboard",
  description: "A single pane of glass for your personal GitHub profile, repositories, PRs, and issues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
