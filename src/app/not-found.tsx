import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist. Return to LEB Monitor for live conflict news.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-foreground gap-4">
      <h1 className="text-6xl font-bold tracking-tighter text-muted-foreground">
        404
      </h1>
      <p className="text-muted-foreground text-lg">Page not found</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        title="Go to LEB Monitor home page"
        aria-label="Return to LEB Monitor Live Feed"
      >
        Back to Live Feed
      </Link>
    </div>
  );
}
