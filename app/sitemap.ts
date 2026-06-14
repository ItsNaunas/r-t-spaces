import type { MetadataRoute } from "next";

const BASE = "https://www.rtspaces.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/studio",
    "/equipment",
    "/services",
    "/members",
    "/gallery",
    "/faq",
    "/book-online",
    "/policies",
  ];
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
