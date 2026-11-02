import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { getPosts } from "@/content/blog";
import { site } from "@/content/profile";
import s from "./blog.module.css";

const description = "직접 만들고 고치며 남긴 개발 기록";

export const metadata: Metadata = {
  title: "블로그",
  description,
  alternates: { canonical: "/blog/" },
  openGraph: { title: "블로그", description, url: "/blog/", images: ["/og.png"] },
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className={`container ${s.page}`}>
      <Eyebrow as="p">Blog</Eyebrow>
      <h1 className={s.title}>블로그</h1>
      <p className={s.lede}>{description}</p>
      {posts.length > 0 && (
        <ul className={s.list}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}/`}>
                <time dateTime={p.published}>{p.published}</time>
                <span className={s.postTitle}>{p.title}</span>
                <span className={s.postDesc}>{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className={s.older}>
        이전 글은 <a href={site.blog}>티스토리</a>에 있음
      </p>
    </div>
  );
}
