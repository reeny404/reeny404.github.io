# 포트폴리오를 사이드 프로젝트로 다시 만들기 (3) 디자인 토큰

> 초안. `[다듬기]`는 본인 의견으로 채울 부분.

## 문제: 문서와 화면이 어긋난다

첫 정적 버전에서는 `tokens.css`와 `DESIGN.md`가 따로 있었다. 색을 하나 바꾸면 문서도 손으로 고쳐야 했고, 대비 비율은 따로 계산해야 했다. PlotPlan에서 "같은 상태를 여러 곳에서 들고 있으면 언젠가 달라진다"고 정리한 문제와 같은 모양.

## 단일 원본: `src/design/tokens.ts`

```ts
export const colors = [
  { name: "text", light: palette.navy900, dark: palette.fog100, usage: "제목과 본문", on: "bg" },
  { name: "accent", light: palette.teal700, dark: palette.teal400, usage: "변경 결과, 선택, 링크", on: "bg" },
  // ...
] as const;
```

이 객체 하나에서 두 가지를 만든다.

1. **CSS 변수**: `tokens-css.ts`가 `:root{--color-text:...}`와 다크 모드 규칙을 문자열로 만들고, layout이 `<style>`로 첫 HTML에 넣는다. 외부 CSS 요청이 없고 JS도 필요 없음
2. **문서**: `/system` 페이지가 같은 객체를 읽어 색 견본, 글자 크기, 간격, 움직임을 렌더링. `on` 필드가 있는 텍스트 색은 빌드할 때 WCAG 대비 비율을 계산해 함께 표시

문서와 화면의 값이 어긋날 수 없는 구조.

## 다크 모드와 깜빡임

저장된 테마를 React가 읽으면 첫 화면이 밝게 그려졌다가 어두워지는 깜빡임이 생긴다. Next.js 16 문서의 "Preventing flash before hydration" 가이드대로 `<head>`의 인라인 스크립트가 paint 전에 `data-theme`을 설정.

테마 전환은 View Transitions API로 클릭한 지점에서 원형으로 퍼지게 했다. 지원하지 않는 브라우저와 움직임 줄이기 설정에서는 즉시 전환.

## 움직임 규칙

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--duration-instant` | 80ms | 누름 |
| `--duration-fast` | 140ms | hover, 포커스 |
| `--duration-base` | 220ms | 열림, 이동 |
| `--duration-slow` | 380ms | 페이지 전환 |
| `--ease-spring` | CSS `linear()` | 드롭, 스냅 |

transform과 opacity만 움직인다. `prefers-reduced-motion`에서는 모든 duration이 0ms가 되도록 토큰 단계에서 처리.

`linear()` easing으로 스프링 느낌을 JS 없이 냄. [다듬기] 이 값을 고른 과정.

## 컴포넌트

Metric, Note(기본, scope, caution), DataTable, Compare, Button, TagList, CodeFlow. 모든 사례가 같은 컴포넌트를 쓰고 `/system`도 같은 컴포넌트를 그대로 렌더링한다.

- **Metric**: 화살표는 스크린리더에서 숨기고 "에서"로 읽히게 처리
- **Note scope**: 직접 담당 범위와 다른 사람의 작업 구분. 경력 서술에서 가장 신경 쓴 부분을 컴포넌트로 고정

## 다음 글

(4) 사이트 전체에 실행 취소 넣기
