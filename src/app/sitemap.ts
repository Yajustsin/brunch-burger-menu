import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.brunchburger.ir/",
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
