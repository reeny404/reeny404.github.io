/**
 * 디자인 토큰의 단일 원본.
 * CSS 변수(tokens-css.ts)와 /system 페이지가 모두 이 객체에서 만들어진다.
 */

export const palette = {
  white: "#FFFFFF",
  mist100: "#EDF2F5",
  mist200: "#DCE5EB",
  mist300: "#C8D4DD",
  slate600: "#465B6B",
  navy900: "#16324B",
  navy950: "#0B1A28",
  charcoal900: "#141414",
  charcoal850: "#1B1B1B",
  charcoal800: "#232323",
  charcoal700: "#363636",
  gray300: "#A6A6A6",
  gray100: "#EDEDED",
  teal700: "#006D75",
  teal100: "#E4F2F1",
  teal400: "#5FC4C9",
  teal900: "#123A40",
  amber700: "#8A5A00",
  amber100: "#FBF1DC",
  amber300: "#E6B65C",
  amber900: "#3A2E14",
  coral600: "#C2410C",
  coral300: "#FB923C",
} as const;

type Hex = (typeof palette)[keyof typeof palette];

export type ColorToken = {
  name: string;
  light: Hex;
  dark: Hex;
  usage: string;
  /** 대비를 검사할 배경 토큰 이름. 없으면 검사하지 않는 면(surface) 토큰 */
  on?: string;
};

export const colors = [
  { name: "bg", light: palette.white, dark: palette.charcoal900, usage: "페이지 바탕" },
  { name: "bg-raised", light: palette.white, dark: palette.charcoal850, usage: "도식, 패널, 팔레트" },
  { name: "bg-sunken", light: palette.mist100, dark: palette.charcoal800, usage: "캔버스, 코드 흐름 바탕" },
  { name: "text", light: palette.navy900, dark: palette.gray100, usage: "제목과 본문", on: "bg" },
  { name: "text-muted", light: palette.slate600, dark: palette.gray300, usage: "보조 설명, 수정 전 수치", on: "bg" },
  { name: "line", light: palette.mist300, dark: palette.charcoal700, usage: "구분선, 테두리" },
  { name: "line-subtle", light: palette.mist200, dark: palette.charcoal800, usage: "캔버스 격자" },
  { name: "accent", light: palette.teal700, dark: palette.teal400, usage: "변경 결과, 선택, 링크", on: "bg" },
  { name: "accent-soft", light: palette.teal100, dark: palette.teal900, usage: "직접 담당 범위 바탕" },
  { name: "caution", light: palette.amber700, dark: palette.amber300, usage: "해석 한계, 진행 중", on: "bg" },
  { name: "caution-soft", light: palette.amber100, dark: palette.amber900, usage: "해석 한계 바탕" },
  { name: "flash", light: palette.coral600, dark: palette.coral300, usage: "render 발생 표시(데모 전용)", on: "bg-sunken" },
] as const satisfies readonly ColorToken[];

export const typography = {
  fontSans: `var(--font-pretendard), "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`,
  fontMono: `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`,
  scale: [
    { name: "xs", size: "0.8125rem", usage: "측정 조건, 라벨" },
    { name: "sm", size: "0.9375rem", usage: "표, 메뉴, 보조 설명" },
    { name: "md", size: "1.0625rem", usage: "본문" },
    { name: "lg", size: "1.25rem", usage: "요약, 소제목" },
    { name: "xl", size: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", usage: "섹션 제목" },
    { name: "2xl", size: "clamp(2.25rem, 1.5rem + 3vw, 3.75rem)", usage: "페이지 제목" },
    { name: "metric", size: "clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)", usage: "변경 후 수치" },
  ],
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  leading: { tight: 1.2, snug: 1.45, body: 1.7 },
  tracking: { tight: "-0.025em", label: "0.06em" },
} as const;

export const space = [
  ["1", "0.25rem"],
  ["2", "0.5rem"],
  ["3", "0.75rem"],
  ["4", "1rem"],
  ["5", "1.5rem"],
  ["6", "2rem"],
  ["7", "3rem"],
  ["8", "4rem"],
  ["9", "6rem"],
] as const;

export const radius = { sm: "4px", md: "8px", lg: "14px", pill: "999px" } as const;

export const motion = {
  duration: [
    { name: "instant", value: "80ms", usage: "누름, 색 변화" },
    { name: "fast", value: "140ms", usage: "hover, 포커스" },
    { name: "base", value: "220ms", usage: "열림과 닫힘, 이동" },
    { name: "slow", value: "380ms", usage: "페이지 전환, 큰 이동" },
  ],
  easing: [
    { name: "out", value: "cubic-bezier(0.2, 0.8, 0.2, 1)", usage: "들어오는 요소" },
    { name: "in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)", usage: "자리 이동" },
    { name: "spring", value: "linear(0, 0.31 8%, 0.82 20%, 1.04 30%, 1.07 38%, 1.01 52%, 0.99 66%, 1)", usage: "드롭, 스냅" },
  ],
} as const;

export const layout = {
  content: "76rem",
  prose: "42rem",
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 2.5rem)",
  header: "3.5rem",
} as const;

export const breakpoints = { sm: 480, md: 768, lg: 1024, xl: 1280 } as const;
