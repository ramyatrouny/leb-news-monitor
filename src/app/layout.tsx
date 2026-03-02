import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Arabic } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a12",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://leb-news-monitor.vercel.app"),
  title: {
    default: "LEB Monitor — Live Conflict Feed",
    template: "%s | LEB Monitor",
  },
  description:
    "Realtime multi-source news monitor aggregating 47+ RSS feeds covering the Lebanon-Israel conflict, humanitarian updates, and Middle East breaking news.",
  keywords: [
    "Lebanon",
    "Israel",
    "conflict monitor",
    "Middle East news",
    "RSS aggregator",
    "breaking news",
    "humanitarian",
    "ceasefire",
    "UNIFIL",
    "realtime feed",
  ],
  authors: [{ name: "LEB Monitor" }],
  creator: "LEB Monitor",
  openGraph: {
    title: "LEB Monitor — Live Conflict Feed",
    description:
      "Realtime multi-source news monitor aggregating 47+ RSS feeds covering the Lebanon-Israel conflict.",
    type: "website",
    locale: "en_US",
    siteName: "LEB Monitor",
  },
  twitter: {
    card: "summary",
    title: "LEB Monitor — Live Conflict Feed",
    description:
      "Realtime multi-source news monitor for the Lebanon-Israel conflict.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body
        className={`${poppins.variable} ${notoArabic.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics gaId="G-R2L7NG8ET3" />
      </body>
    </html>
  );
}
