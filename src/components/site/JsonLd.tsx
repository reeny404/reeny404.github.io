import type { Metadata } from "next";
import { caseStudies } from "@/content/cases";
import { site } from "@/content/profile";

type CaseSlug = keyof typeof caseStudies;

/** 검색엔진과 AI가 읽는 구조화 데이터. `<`를 이스케이프해 문자열 안의 </script>로 태그가 끊기지 않게 함 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const author = { "@type": "Person", name: site.name, alternateName: site.nameEn, url: site.url };

/** 사례 페이지: 글(Article)과 홈 > 사례 > 제목 경로(BreadcrumbList) */
export function caseJsonLd(slug: CaseSlug) {
  const { title, description, published, modified } = caseStudies[slug];
  const url = `${site.url}/work/${slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        image: `${site.url}/og.png`,
        inLanguage: "ko",
        datePublished: published,
        dateModified: modified,
        author,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "사례", item: `${site.url}/#work` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };
}

export function caseMetadata(slug: CaseSlug): Metadata {
  const { title, description, published, modified } = caseStudies[slug];
  const path = `/work/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      images: ["/og.png"],
      url: path,
      publishedTime: published,
      modifiedTime: modified,
      authors: [site.url],
    },
  };
}
