import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Arabic } from "next/font/google";
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
  themeColor: "#0a0a12",
};

export const metadata: Metadata = {
  title: "LEB Monitor — Live Conflict Feed",
  description:
    "Realtime multi-source news monitor for the Lebanon-Israel conflict",
  openGraph: {
    title: "LEB Monitor — Live Conflict Feed",
    description:
      "Realtime multi-source news monitor for the Lebanon-Israel conflict",
    type: "website",
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
      </body>
    </html>
  );
}
