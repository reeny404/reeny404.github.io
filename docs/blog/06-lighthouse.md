# 포트폴리오를 사이드 프로젝트로 다시 만들기 (6) Lighthouse 72점에서 97점으로

> 초안. `[다듬기]`는 본인 의견으로 채울 부분.

## 측정 조건

- Lighthouse 12.8.2, 기본 mobile 설정(simulated throttling: RTT 150ms, 약 1.6Mbps, CPU 4배 감속)
- 로컬에서 `next build` 결과물을 gzip을 지원하는 정적 서버(`serve`)로 서빙
- 아래 표는 페이지별 1회 측정값. CI는 같은 조건으로 페이지마다 3회 측정

## 처음 결과

| 페이지 | Performance | FCP | LCP |
| --- | ---: | ---: | ---: |
| `/` | 74 | 3.6s | 4.8s |
| `/work/plotplan/` | 78 | 3.3s | 4.0s |
| `/system/` | 75 | 3.6s | 4.8s |

desktop은 98~99점. mobile만 낮았다.

## 원인 1: render-blocking CSS

CSS 파일 두 개(약 22KB)가 렌더링을 막고 있었다. CSS가 작고 방문자 대부분이 첫 방문인 포트폴리오이므로 Next.js의 `experimental.inlineCss`로 HTML에 넣음. 다시 방문할 때 CSS 캐시를 쓰지 못하는 단점은 감수.

결과: render-blocking 요청 0개. 그런데 점수는 거의 그대로(74).

## 원인 2: 폰트 420KB

network 의존성 트리를 보니 Pretendard dynamic subset 조각 16개(약 420KB)가 첫 페인트 전에 요청되고 있었다. dynamic subset은 unicode-range로 92조각을 나눠 필요한 조각만 받는 방식인데, 한글이 많은 페이지는 조각 대부분이 필요해진다.

이 사이트는 콘텐츠가 코드에 있으므로 쓰이는 글자를 빌드 전에 알 수 있다. `scripts/subset-font.mjs`가 `src/`의 모든 문자를 모아 `subset-font`로 Pretendard Variable을 잘라 낸다.

```
subset-font: 599 glyphs (Hangul 480), 2009KB → 120KB
```

`next/font/local`로 이 파일 하나를 preload. 없는 글자(명령 팔레트에 사용자가 입력한 글자 등)는 다음 서체로 대체된다. `prebuild` 스크립트에 연결해 콘텐츠가 바뀌면 자동으로 다시 만든다.

## 결과

| 페이지 | Performance | FCP | LCP | Accessibility | SEO |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 97 | 0.9s | 2.6s | 100 | 100 |
| `/work/plotplan/` | 96 | 0.9s | 2.7s | 100 | 100 |
| `/work/miridih/` | 96 | 0.8s | 2.7s | 100 | 100 |
| `/system/` | 96 | 0.8s | 2.7s | 100 | 100 |

desktop은 측정한 네 페이지 모두 100점, CLS는 전 페이지 0. Lighthouse CI(mobile, 3회)는 ChipNSoDA를 포함한 다섯 페이지 모두 기준 통과.

## 접근성 100까지

Lighthouse가 잡아 준 것:

- render 데모 노드가 모바일에서 17.7px로 24px 터치 기준 미달 → 좁은 화면에서 열 수를 16에서 12로
- ⌘K 버튼의 `aria-label`이 화면에 보이는 "명령" 글자를 포함하지 않음 → `aria-label`을 지우고 숨김 텍스트로 이름 구성
- 기존/변경 비교의 `h4`가 `h3` 없이 등장 → 제목이 아닌 라벨로 변경

## 남은 것

- mobile LCP 2.6s의 대부분은 폰트 교체 후 다시 그려지는 render delay. `font-display: optional`이면 더 줄지만, 느린 연결의 첫 방문에서 Pretendard가 아예 보이지 않음. 디자인 일관성을 택해 `swap` 유지
- [다듬기] 실제 배포 후 GitHub Pages(HTTP/2, gzip)에서 다시 측정한 값

## CI에서 지키기

`lighthouserc.json`의 기준: Performance 0.9 이상, Accessibility, Best Practices, SEO 1.0, CLS 0.01 이하. 하나라도 못 넘으면 GitHub Actions가 배포를 멈춘다. 점수를 한 번 올리는 것보다 떨어지지 않게 하는 것이 목표.
