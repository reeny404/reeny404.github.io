import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked } from "marked";

export type Heading = { id: string; text: string };

/** published, modified: 글 페이지의 JSON-LD, og:article 시간, sitemap lastModified에 쓰임. toc: 본문 ## 제목 목록 */
export type Post = { slug: string; title: string; description: string; published: string; modified: string; html: string; toc: Heading[] };

// 파일 하나가 글 하나. docs/blog의 초안을 다듬어 여기로 옮기면 발행
const dir = join(process.cwd(), "src/content/blog");
const required = ["title", "description", "published"] as const;

// 제목마다 id를 붙여 목차와 절 단위 링크에 씀. 한글은 그대로 두고 문장부호는 빼고 공백은 -로
function render(md: string) {
  const toc: Heading[] = [];
  const used = new Map<string, number>();
  const parser = new Marked({
    renderer: {
      heading({ tokens, depth, text }) {
        const plain = text.replace(/[`*_]/g, "");
        const base = plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        const id = n > 1 ? `${base}-${n}` : base;
        if (depth === 2) toc.push({ id, text: plain });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
  });
  return { html: parser.parse(md, { async: false }), toc };
}

// 맨 위 --- 사이의 `key: value` 줄. 필드가 빠지면 빌드를 멈춰 빈 제목, 빈 설명으로 배포되지 않게 함
function parse(slug: string, raw: string): Post {
  const head = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!head) throw new Error(`blog/${slug}.md: 맨 위에 --- 로 감싼 title, description, published가 필요함`);
  const meta: Record<string, string> = Object.fromEntries(
    head[1].split(/\r?\n/).map((line) => [line.slice(0, line.indexOf(":")).trim(), line.slice(line.indexOf(":") + 1).trim()]),
  );
  for (const key of required) if (!meta[key]) throw new Error(`blog/${slug}.md: ${key} 없음`);
  return {
    slug,
    title: meta.title,
    description: meta.description,
    published: meta.published,
    modified: meta.modified || meta.published,
    ...render(raw.slice(head[0].length)),
  };
}

/** 최신 글이 앞 */
export function getPosts(): Post[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.slice(0, -3), readFileSync(join(dir, f), "utf8")))
    .sort((a, b) => b.published.localeCompare(a.published));
}
