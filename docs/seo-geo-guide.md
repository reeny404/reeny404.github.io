# SEO, GEO 따라하기

검색엔진(Google, 네이버, Bing)과 AI 검색(ChatGPT, Claude, Perplexity, Google AI 개요)에 사이트가 잘 잡히게 만드는 순서. 위에서부터 하나씩 하면 된다. 코드 예시는 Next.js App Router 기준이지만, 다른 프레임워크도 결과물 HTML에 같은 태그가 나오면 된다.

- **SEO**: 검색 결과 목록에 내 페이지가 나오게 하는 일
- **GEO**(Generative Engine Optimization): AI가 답변을 만들 때 내 페이지를 읽고 인용하게 하는 일

둘은 따로 노는 게 아니다. AI 검색도 결국 검색 인덱스(Google, Bing)에서 문서를 찾아 읽는다. 그래서 순서는 **SEO 기본 → 구조화 데이터 → GEO 보강 → 외부 등록**.

---

## 0단계. 먼저 확인할 것

브라우저에서 페이지를 열고 `보기 > 소스 보기`(Ctrl+U / ⌘⌥U)로 원본 HTML을 본다.

- [ ] 본문 텍스트가 HTML 안에 그대로 있다 (JavaScript가 돌아야 글이 생기는 구조면 크롤러가 못 읽을 수 있음. 정적 생성이나 SSR 권장)
- [ ] `<html lang="ko">`처럼 언어가 지정돼 있다
- [ ] 페이지마다 `<h1>`이 하나 있고, 그 아래로 `<h2>`, `<h3>` 순서가 맞다
- [ ] 이미지에 `alt`가 있다

여기가 안 되면 아래 작업 효과가 거의 없다.

---

## 1단계. 페이지마다 제목, 설명, 대표 주소

모든 페이지에 이 네 가지가 있어야 한다.

| 태그 | 하는 일 |
| --- | --- |
| `<title>` | 검색 결과의 파란 제목 |
| `<meta name="description">` | 제목 아래 회색 설명. 페이지 내용을 1~2문장으로 |
| `<link rel="canonical">` | "이 페이지의 대표 주소는 이것". 같은 내용이 여러 주소로 열릴 때 점수가 나뉘지 않게 함 |
| Open Graph (`og:*`) | 카카오톡, 슬랙, X 등에 링크를 붙였을 때 나오는 카드 |

Next.js에서는 `layout.tsx`에 공통값을, 각 `page.tsx`에 페이지 값을 쓴다.

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"), // 상대 주소를 절대 주소로 바꿔 줌
  title: { default: "사이트 이름", template: "%s | 사이트 이름" },
  description: "사이트 전체 설명",
  openGraph: { type: "website", locale: "ko_KR", siteName: "사이트 이름", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: "소개",
  description: "이 페이지 설명",
  alternates: { canonical: "/about/" },
  openGraph: { title: "소개", description: "이 페이지 설명", url: "/about/", images: ["/og.png"] },
};
```

**자주 하는 실수**

- 하위 페이지에 `openGraph`를 안 쓰면 루트 값(홈 주소, 홈 제목)을 그대로 물려받는다. 그 페이지 링크를 공유해도 홈 카드가 나온다. 페이지마다 `openGraph.url`과 `title`을 꼭 쓴다.
- canonical 주소의 끝 `/` 유무를 실제 주소와 맞춘다 (`trailingSlash` 설정 확인).
- OG 이미지는 1200×630 PNG/JPG.

---

## 2단계. robots.txt와 sitemap.xml

- **robots.txt**: 크롤러에게 "여기는 들어와도 됨/안 됨"을 알린다. sitemap 위치도 여기에 적는다.
- **sitemap.xml**: 사이트의 페이지 목록과 마지막 수정일. 크롤러가 무엇을 언제 다시 볼지 정하는 데 쓴다.

```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // AI 크롤러. `*`로도 허용되지만 명시해 두면 의도가 분명함
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}

// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://example.com/", lastModified: new Date("2026-10-20") },
    { url: "https://example.com/about/", lastModified: new Date("2026-10-01") },
  ];
}
```

> AI 크롤러를 막고 싶다면 반대로 `disallow: "/"`를 쓴다. 막으면 AI 답변에 인용될 가능성도 함께 사라진다.

**자주 하는 실수**

- `lastModified`를 빌드할 때마다 `new Date()`로 넣는 것. 모든 페이지가 매번 바뀐 것처럼 보여 신호가 무의미해진다. 실제로 내용을 고친 날짜를 넣는다.
- 정적 export(`output: "export"`)에서는 `export const dynamic = "force-static"`을 붙여야 파일이 만들어진다.

---

## 3단계. 구조화 데이터 (JSON-LD)

HTML에 "이 페이지는 사람 소개다", "이건 글이고 작성자는 누구, 수정일은 언제"를 기계가 읽는 형식으로 적는다. Google 리치 결과와 AI가 사실을 인용할 때 근거로 쓴다.

| 페이지 종류 | 쓸 타입 |
| --- | --- |
| 개인 소개, 포트폴리오 홈 | `ProfilePage` + `Person` |
| 회사, 서비스 홈 | `Organization`, `WebSite` |
| 글, 사례, 블로그 | `Article` (+ `BreadcrumbList`) |
| 자주 묻는 질문 | `FAQPage` |

```tsx
// 공용 컴포넌트. `<`를 이스케이프해야 문자열 안의 </script>로 태그가 끊기지 않음
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

// 글 페이지에서
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "글 제목",
    description: "글 요약",
    url: "https://example.com/posts/hello/",
    datePublished: "2026-10-15",
    dateModified: "2026-10-19",
    author: { "@type": "Person", name: "작성자", url: "https://example.com" },
  }}
/>
```

`Person`에는 `sameAs`로 GitHub, 블로그, LinkedIn 같은 외부 프로필 주소를 넣는다. 여러 사이트의 정보가 같은 사람이라고 묶이는 근거가 된다.

**확인**: [리치 결과 테스트](https://search.google.com/test/rich-results), [Schema Markup Validator](https://validator.schema.org/)에 주소를 넣어 오류가 없는지 본다.

---

## 4단계. GEO: AI가 인용하기 좋은 글로 만들기

AI는 페이지에서 짧고 확실한 문장을 뽑아 답변에 넣는다. 그러니 뽑기 쉽게 써 둔다.

- [ ] **첫 문단에 결론.** "무엇을, 왜, 결과는"을 2~3문장으로. 배경 설명은 그다음
- [ ] **수치에는 조건을 붙인다.** "로딩 5초 → 2초"보다 "로딩 5초 → 2초(Lighthouse mobile, 3회 평균)". 조건이 있어야 AI가 출처로 믿고 인용한다
- [ ] **제목(h2, h3)을 질문이나 주제어로.** "어떻게 해결했나", "측정 조건"처럼 내용이 드러나게
- [ ] **표와 목록 활용.** 비교, 단계, 수치는 문단보다 표가 잘 뽑힌다
- [ ] **작성일과 수정일을 화면에도 표시.** 최신 정보를 선호하는 AI 검색에 유리
- [ ] **`/llms.txt` 제공** (선택). 사이트 요약과 주요 페이지 링크를 마크다운으로 정리한 파일. 아직 공식 표준은 아니지만 만드는 비용이 거의 없다

```md
# 사이트 이름

> 이 사이트가 무엇인지 한두 문장.

## 주요 페이지

- [페이지 제목](https://example.com/page/): 이 페이지에서 알 수 있는 것 한 줄
```

---

## 5단계. 검색 콘솔 등록 (가장 효과가 큼)

코드를 아무리 잘 짜도 검색엔진이 사이트를 모르면 소용없다. 세 곳에 등록한다.

| 서비스 | 왜 | 주소 |
| --- | --- | --- |
| Google Search Console | Google 검색, Google AI 개요 | https://search.google.com/search-console |
| 네이버 서치어드바이저 | 한국어 사이트는 필수. 등록하지 않으면 거의 수집되지 않음 | https://searchadvisor.naver.com |
| Bing Webmaster Tools | ChatGPT 검색, Copilot이 Bing 인덱스를 씀 | https://www.bing.com/webmasters |

### 공통 순서

1. 사이트 주소를 등록한다 (Google은 "URL 접두어" 방식 선택)
2. 소유권 확인 방법으로 **HTML 태그(메타태그)** 를 고른다
3. 화면에 나온 `content="..."` 안의 코드만 복사한다
4. 코드를 사이트 `<head>`에 넣고 배포한다 (아래 참고)
5. 콘솔로 돌아가 **확인** 버튼
6. **sitemap 제출**: `https://내도메인/sitemap.xml` 입력
7. 네이버는 `요청 > 웹 페이지 수집`, Google은 `URL 검사 > 색인 생성 요청`으로 주요 페이지를 직접 요청하면 더 빨리 잡힌다

> Bing은 "Google Search Console에서 가져오기"를 고르면 1~6을 건너뛸 수 있다.

### 확인 코드 넣기 (Next.js)

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.NAVER_SITE_VERIFICATION && { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }),
      ...(process.env.BING_SITE_VERIFICATION && { "msvalidate.01": process.env.BING_SITE_VERIFICATION }),
    },
  },
};
```

확인 코드는 HTML에 공개되는 값이라 비밀이 아니다. 그래도 코드에 직접 박기보다 환경변수로 두면 바꾸기 쉽다. GitHub Actions로 배포한다면:

1. 저장소 `Settings > Secrets and variables > Actions > Variables` 탭
2. `New repository variable`로 `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` 추가
3. 워크플로의 빌드 단계에서 넘긴다

```yaml
- run: npm run build
  env:
    GOOGLE_SITE_VERIFICATION: ${{ vars.GOOGLE_SITE_VERIFICATION }}
    NAVER_SITE_VERIFICATION: ${{ vars.NAVER_SITE_VERIFICATION }}
    BING_SITE_VERIFICATION: ${{ vars.BING_SITE_VERIFICATION }}
```

배포 뒤 소스 보기에서 `google-site-verification`을 검색해 태그가 있는지 확인하고 나서 콘솔의 확인 버튼을 누른다.

---

## 6단계. 외부에서 들어오는 링크 만들기

검색엔진도 AI도 "다른 곳에서 이 사이트를 얼마나 언급하나"를 신뢰 신호로 본다. 특히 GEO는 사이트 밖 언급의 영향이 크다.

- [ ] GitHub 프로필 README, 저장소 About의 Website 칸에 사이트 주소
- [ ] 블로그 글 본문이나 프로필에 사이트 링크
- [ ] LinkedIn 등 프로필의 웹사이트 칸
- [ ] 위 주소들을 JSON-LD `sameAs`에도 넣어 서로 연결

---

## 다 했는지 확인

| 확인 | 방법 |
| --- | --- |
| 메타태그 | 소스 보기에서 `<title>`, `description`, `canonical`, `og:` 검색 |
| 공유 카드 | [opengraph.xyz](https://www.opengraph.xyz/)에 주소 입력, 카카오톡은 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing) |
| 구조화 데이터 | 리치 결과 테스트 |
| robots, sitemap | `/robots.txt`, `/sitemap.xml`을 브라우저로 직접 열어 보기 |
| 색인 여부 | Google에 `site:내도메인` 검색, Search Console `페이지` 보고서 |
| 성능 | Lighthouse의 SEO 항목 100점, Core Web Vitals 통과 |
| AI 인용 | ChatGPT, Perplexity 등에 사이트 주제로 질문해 출처에 내 페이지가 나오는지 (색인 후 몇 주 걸림) |

## 계속 할 일

- 페이지 본문을 고치면 sitemap의 수정일, JSON-LD의 `dateModified`도 같이 바꾼다
- 새 페이지를 만들면 1~3단계(메타데이터, sitemap, JSON-LD)를 함께 추가한다
- 한 달에 한 번 Search Console과 서치어드바이저에서 오류, 색인 제외 페이지를 확인한다

---

## 이 저장소에 적용된 위치

| 단계 | 파일 |
| --- | --- |
| 1. 공통 메타데이터, 확인 코드 | `src/app/layout.tsx` |
| 1. 페이지 메타데이터 | 각 `src/app/**/page.tsx`, 사례는 `caseMetadata()` (`src/components/site/JsonLd.tsx`) |
| 2. robots, sitemap | `src/app/robots.ts`, `src/app/sitemap.ts` |
| 3. JSON-LD | 홈 `src/app/page.tsx`(ProfilePage), 사례 `caseJsonLd()`(Article, BreadcrumbList) |
| 3, 4. 사례 작성일, 수정일 | `src/content/cases.ts`의 `published`, `modified` (sitemap, JSON-LD, og:article이 같이 씀) |
| 4. llms.txt | `public/llms.txt` |
| 5. 확인 코드 변수 | `.github/workflows/deploy.yml`, 값은 Repository variables |
