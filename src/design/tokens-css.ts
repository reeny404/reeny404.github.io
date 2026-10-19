import { colors, layers, layout, motion, radius, scrim, shadows, space, typography } from "./tokens";

/** tokens.ts를 :root CSS 변수로 변환. layout에서 <style>로 한 번 주입한다. */

const decl = (entries: [string, string | number][]) =>
  entries.map(([k, v]) => `--${k}:${v};`).join("");

// 그림자와 스크림도 바탕색에 따라 바뀌므로 색과 함께 테마별 블록에 넣음
const themed = (mode: "light" | "dark") =>
  decl([
    ...colors.map((c) => [`color-${c.name}`, c[mode]] as [string, string]),
    ["color-scrim", scrim[mode]],
    ...shadows.map((sh) => [`shadow-${sh.name}`, sh[mode]] as [string, string]),
  ]);
const lightColors = themed("light");
const darkColors = themed("dark");

const base = decl([
  ["font-sans", typography.fontSans],
  ["font-mono", typography.fontMono],
  ...typography.scale.map((s) => [`text-${s.name}`, s.size] as [string, string]),
  ...Object.entries(typography.weight).map(([k, v]) => [`weight-${k}`, v] as [string, number]),
  ...Object.entries(typography.leading).map(([k, v]) => [`leading-${k}`, v] as [string, number]),
  ...Object.entries(typography.tracking).map(([k, v]) => [`tracking-${k}`, v] as [string, string]),
  ...space.map(([k, v]) => [`space-${k}`, v] as [string, string]),
  ...Object.entries(radius).map(([k, v]) => [`radius-${k}`, v] as [string, string]),
  ...motion.duration.map((d) => [`duration-${d.name}`, d.value] as [string, string]),
  ...motion.easing.map((e) => [`ease-${e.name}`, e.value] as [string, string]),
  ...layers.map((l) => [`layer-${l.name}`, l.value] as [string, number]),
  ["width-content", layout.content],
  ["width-prose", layout.prose],
  ["gutter", layout.gutter],
  ["header-height", layout.header],
]);

export const tokensCss = [
  `:root{color-scheme:light;${base}${lightColors}}`,
  `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${darkColors}}}`,
  `:root[data-theme="dark"]{color-scheme:dark;${darkColors}}`,
  `@media (prefers-reduced-motion:reduce){:root{${decl(motion.duration.map((d) => [`duration-${d.name}`, "0ms"]))}}}`,
].join("");
