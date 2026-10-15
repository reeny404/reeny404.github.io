import type { MetadataRoute } from "next";
import { site } from "@/content/profile";

export const dynamic = "force-static";

const paths = ["/", "/work/plotplan/", "/work/chipnsoda/", "/work/miridih/", "/system/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: new URL(p, site.url).toString(),
    lastModified: new Date("2026-10-15"),
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : 0.8,
  }));
}
