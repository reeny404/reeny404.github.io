import type { MetadataRoute } from "next";
import { getPosts } from "@/content/blog";
import { caseStudies } from "@/content/cases";
import { site } from "@/content/profile";

export const dynamic = "force-static";

const posts = getPosts();

// 본문을 고친 날짜. 크롤러가 다시 방문할지 판단하는 근거라 실제로 바뀐 페이지만 갱신
const pages: { path: string; modified: string }[] = [
  { path: "/", modified: "2026-10-20" },
  ...Object.entries(caseStudies).map(([slug, c]) => ({ path: `/work/${slug}/`, modified: c.modified })),
  { path: "/lab/", modified: "2026-10-20" },
  { path: "/system/", modified: "2026-10-20" },
  ...posts.map((p) => ({ path: `/blog/${p.slug}/`, modified: p.modified })),
  // 목록은 새 글이 올라올 때 바뀜
  { path: "/blog/", modified: posts[0]?.published ?? "2026-11-02" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, modified }) => ({
    url: new URL(path, site.url).toString(),
    lastModified: new Date(modified),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
