import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LEB Monitor — Live Lebanon-Israel Conflict News Feed",
    short_name: "LEBMON",
    description:
      "Real-time multi-source news monitor aggregating 47+ RSS feeds for the Lebanon-Israel conflict",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#0a0a12",
    categories: ["news", "politics"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
