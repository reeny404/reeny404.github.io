import type { MetadataRoute } from "next";
import { site } from "@/content/profile";

export const dynamic = "force-static";

// AI 검색과 답변에 인용되도록 AI 크롤러도 명시적으로 허용 (`*`로도 허용되지만 의도를 드러냄)
const aiCrawlers = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
