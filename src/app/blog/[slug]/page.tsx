import type { Metadata } from "next";
import { Gaegu } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, postJsonLd } from "@/components/site/JsonLd";
import { getPosts } from "@/content/blog";
import { Toc } from "../Toc";
import s from "../blog.module.css";

// 손그림 SVG의 글자용 손글씨체. 글 페이지에서만 받고, 한글은 unicode-range 조각 중 쓰인 글자가 든 것만 받음
const hand = Gaegu({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-hand" });

// 정적 export라 빌드 때 만든 글 말고는 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

async function findPost(params: PageProps<"/blog/[slug]">["params"]) {
  const { slug } = await params;
  return getPosts().find((p) => p.slug === slug) ?? notFound();
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug, title, description, published, modified } = await findPost(params);
  const path = `/blog/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path, images: ["/og.png"], publishedTime: published, modifiedTime: modified },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await findPost(params);
  return (
    <article className={`container ${s.page} ${hand.variable}`}>
      <JsonLd data={postJsonLd(post)} />
      <Link className={s.back} href="/blog/">
        ← 블로그
      </Link>
      <h1 className={s.title}>{post.title}</h1>
      <p className={s.lede}>{post.description}</p>
      <p className={s.date}>
        <time dateTime={post.published}>{post.published}</time>
        {post.modified !== post.published && (
          <>
            {" "}
            (수정 <time dateTime={post.modified}>{post.modified}</time>)
          </>
        )}
      </p>
      {/* 본문은 이 저장소의 md 파일을 빌드 때 변환한 HTML이라 외부 입력이 아님 */}
      <div className={s.layout}>
        <div className={s.body} dangerouslySetInnerHTML={{ __html: post.html }} />
        {post.toc.length > 1 && <Toc items={post.toc} />}
      </div>
    </article>
  );
}
