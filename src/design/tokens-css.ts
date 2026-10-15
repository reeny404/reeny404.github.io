import { colors, layout, motion, radius, space, typography } from "./tokens";

/** tokens.ts를 :root CSS 변수로 변환. layout에서 <style>로 한 번 주입한다. */

const decl = (entries: [string, string | number][]) =>
  entries.map(([k, v]) => `--${k}:${v};`).join("");

const lightColors = decl(colors.map((c) => [`color-${c.name}`, c.light]));
const darkColors = decl(colors.map((c) => [`color-${c.name}`, c.dark]));

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
