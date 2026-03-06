import type { Metadata } from "next";
import Link from "next/link";
import changelogData from "@/data/changelog.json";

export const metadata: Metadata = {
  title: "Changelog",
  description: "All updates to LEB Monitor — auto-generated from commit history.",
  robots: { index: true, follow: true },
};

interface ChangelogEntry {
  hash: string;
  subject: string;
  date: string;
  author: string;
}

const changelog = changelogData as Record<string, ChangelogEntry[]>;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChangelogPage() {
  const dates = Object.keys(changelog);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            title="Return to Live Feed"
            aria-label="Back to LEB Monitor Live Feed"
          >
            &larr; Back to Live Feed
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-1 text-muted-foreground">
            All updates to LEB Monitor
          </p>
        </div>

        {/* Commit list grouped by date */}
        <div className="space-y-8">
          {dates.map((date) => (
            <section key={date}>
              <h2 className="sticky top-0 z-10 bg-background py-2 text-sm font-semibold text-primary border-b border-border">
                {formatDate(date)}
              </h2>
              <div className="mt-3 space-y-3">
                {changelog[date].map((entry) => (
                  <div
                    key={entry.hash}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="text-sm text-card-foreground">{entry.subject}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <code className="font-mono">{entry.hash}</code>
                      <span>{entry.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
