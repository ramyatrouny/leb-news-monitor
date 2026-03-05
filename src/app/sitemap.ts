import type { MetadataRoute } from "next";

const BASE_URL = "https://lebmonitor.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
  ];
}
