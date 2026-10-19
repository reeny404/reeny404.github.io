/**
 * 디자인 토큰의 단일 원본.
 * CSS 변수(tokens-css.ts)와 /system 페이지가 모두 이 객체에서 만들어진다.
 */

export const palette = {
  white: "#FFFFFF",
  // 라이트: 흰 바탕, 짙은 남보라 글자, 일렉트릭 블루 주색
  cloud100: "#F4F6FC",
  cloud200: "#EBEEF6",
  cloud300: "#E1E5F0",
  slate600: "#585F78",
  indigo950: "#161A33",
  blue600: "#2D5BFF",
  blue50: "#EBF0FF",
  amber700: "#A35400",
  amber50: "#FFF4E0",
  coral700: "#C7331B",
  // 다크: 차콜 바탕, 밝은 블루 주색
  charcoal900: "#141414",
  charcoal850: "#1B1B1B",
  charcoal800: "#232323",
  charcoal750: "#2A2A2A",
  charcoal700: "#363636",
  gray300: "#A6A6A6",
  gray100: "#EDEDED",
  blue300: "#7D9BFF",
  blue900: "#1D2747",
  amber300: "#E6B65C",
  amber900: "#3A2E14",
  coral300: "#FF8A75",
  // 장식: 에디터 도형과 일러스트용
  coral500: "#FF6B57",
  yellow400: "#FFC233",
  mint500: "#22C59B",
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
  { name: "bg-sunken", light: palette.cloud100, dark: palette.charcoal800, usage: "캔버스, 코드 흐름 바탕" },
  { name: "text", light: palette.indigo950, dark: palette.gray100, usage: "제목과 본문", on: "bg" },
  { name: "text-muted", light: palette.slate600, dark: palette.gray300, usage: "보조 설명, 수정 전 수치", on: "bg" },
  { name: "border", light: palette.cloud300, dark: palette.charcoal700, usage: "구분선, 테두리" },
  { name: "border-subtle", light: palette.cloud200, dark: palette.charcoal750, usage: "캔버스 격자" },
  { name: "accent", light: palette.blue600, dark: palette.blue300, usage: "변경 결과, 선택, 링크", on: "bg" },
  { name: "accent-soft", light: palette.blue50, dark: palette.blue900, usage: "선택 영역, 범위 노트 바탕" },
  { name: "caution", light: palette.amber700, dark: palette.amber300, usage: "해석 한계, 주의", on: "bg" },
  { name: "caution-soft", light: palette.amber50, dark: palette.amber900, usage: "주의 노트 바탕" },
  { name: "danger", light: palette.coral700, dark: palette.coral300, usage: "고칠 대상을 붉게 표시, render 발생 표시(데모)", on: "bg-sunken" },
  { name: "decorative-coral", light: palette.coral500, dark: palette.coral500, usage: "장식, 도형" },
  { name: "decorative-yellow", light: palette.yellow400, dark: palette.yellow400, usage: "장식, 도형" },
  { name: "decorative-mint", light: palette.mint500, dark: palette.mint500, usage: "장식, 도형" },
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
  leading: { display: 1.1, tight: 1.2, snug: 1.45, relaxed: 1.55, body: 1.7 },
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

export const radius = { xs: "2px", sm: "4px", md: "8px", lg: "14px", pill: "999px" } as const;

/**
 * 바탕 위에 올려 둔 정도. 그림자 색이 바탕에 따라 달라 라이트와 다크 값을 따로 둔다
 */
export const shadows = [
  { name: "subtle", light: "0 1px 2px rgb(22 26 51 / 0.12)", dark: "0 1px 2px rgb(0 0 0 / 0.4)", usage: "segmented 컨트롤의 선택된 칸" },
  {
    name: "raised",
    light: "0 1px 0 var(--color-border), 0 24px 48px -32px rgb(22 26 51 / 0.35)",
    dark: "0 1px 0 var(--color-border), 0 24px 48px -32px rgb(0 0 0 / 0.7)",
    usage: "첫 화면 미니 에디터",
  },
  { name: "float", light: "0 12px 32px -12px rgb(22 26 51 / 0.4)", dark: "0 12px 32px -12px rgb(0 0 0 / 0.6)", usage: "서식 툴바, 실행 취소 알림" },
  { name: "overlay", light: "0 24px 64px -16px rgb(22 26 51 / 0.35)", dark: "0 24px 64px -16px rgb(0 0 0 / 0.6)", usage: "명령 팔레트" },
] as const;

/** 대화상자 뒤를 덮는 막 */
export const scrim = { light: "rgb(22 26 51 / 0.32)", dark: "rgb(0 0 0 / 0.55)" } as const;

/** 겹침 순서. 큰 값이 위. 명령 팔레트는 <dialog> top layer라 여기에 없음 */
export const layers = [
  { name: "header", value: 20, usage: "고정 헤더" },
  { name: "popover", value: 40, usage: "서식 툴바" },
  { name: "toast", value: 50, usage: "실행 취소 알림" },
  { name: "skip-link", value: 100, usage: "본문 바로가기" },
] as const;

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
