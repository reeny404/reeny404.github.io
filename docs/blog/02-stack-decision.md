# 포트폴리오를 사이드 프로젝트로 다시 만들기 (2) 기술 선택

> 초안. `[다듬기]`는 본인 의견으로 채울 부분.

## 후보

| 선택지 | 장점 | 아쉬운 점 |
| --- | --- | --- |
| 정적 HTML/CSS/JS | 빌드 없음, 가장 가벼움 | 주력인 React를 보여 주지 못함. 데모가 늘수록 상태 관리가 번거로움 |
| Astro + React islands | 기본 JS 0, Lighthouse에 가장 유리 | "React 개발자"라는 메시지가 한 단계 간접적 |
| Next.js 정적 export | React 그대로, 페이지별 HTML 생성, 필요한 곳만 클라이언트 컴포넌트 | 런타임 JS가 Astro보다 큼 |

처음 버전은 정적 HTML이었다. 빠르고 단순했지만 사이트 자체를 작업물로 만들기로 하면서 React가 필요해졌고, Lighthouse 점수를 지키려면 서버 없이 HTML을 미리 만들어야 했다. 결론은 **Next.js 16 App Router + `output: "export"`**.

[다듬기] Astro와 끝까지 고민한 부분이 있다면.

## 정적 export에서 신경 쓴 것

- `trailingSlash: true`: GitHub Pages가 `/work/plotplan/index.html`을 그대로 서빙하도록
- `.nojekyll`: `_next` 폴더가 Jekyll에 의해 무시되지 않도록 `public/`에 포함
- OG 이미지: `opengraph-image.tsx` 규칙으로 만들면 확장자 없는 파일이 생겨 GitHub Pages가 잘못된 Content-Type으로 내려줌. `app/og.png/route.tsx` route handler(`force-static`)로 바꿔 `og.png`로 생성
- `sitemap.ts`, `robots.ts`도 `force-static`

## React Compiler를 켜지 않은 이유

Next.js 16은 React Compiler를 옵션으로 지원한다. 켜면 자동 memo가 적용되는데, 이 사이트에는 **불필요한 렌더링을 일부러 보여 주는 데모**가 있다. 컴파일러가 수정 전 코드까지 최적화하면 데모가 거짓말이 된다. 그래서 끔.

## 배포

GitHub Actions에서 lint → build → Lighthouse CI → Pages 배포 순서. Lighthouse 기준을 넘지 못하면 배포하지 않는다. 자세한 기준은 (6) 측정 편에서.

## 다음 글

(3) 디자인 토큰: tokens.ts 하나에서 CSS 변수와 문서까지
