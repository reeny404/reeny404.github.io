"use client";

import { Button } from "@/components/ui";
import { palette } from "@/features/command/palette-store";
import { useShortcutLabels } from "@/features/command/shortcuts";
import { setTheme, useThemeChoice, type ThemeChoice } from "@/features/theme/theme";
import s from "./system.module.css";

const THEMES: [ThemeChoice, string][] = [
  ["light", "라이트"],
  ["dark", "다크"],
  ["system", "시스템"],
];

export function ThemeSwitcher() {
  const choice = useThemeChoice();
  return (
    <div className={s.segmented} role="radiogroup" aria-label="테마">
      {THEMES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          onClick={(e) => setTheme(value, { x: e.clientX, y: e.clientY })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function OpenPaletteButton() {
  const keys = useShortcutLabels();
  return (
    <Button onClick={() => palette.open()}>
      명령 팔레트 열기 <kbd>{keys.palette}</kbd>
    </Button>
  );
}

export function ShortcutTable() {
  const keys = useShortcutLabels();
  const rows: [string, string][] = [
    [keys.palette, "명령 팔레트"],
    [keys.undo, "실행 취소"],
    [keys.redo, "다시 실행"],
    ["Tab", "다음 요소로 이동"],
    ["← ↑ → ↓", "선택한 도형 이동 (Shift: 2칸)"],
    ["R", "선택한 도형 90° 회전 (Shift: 반대 방향)"],
    ["Esc", "선택 해제, 팔레트 닫기"],
  ];
  return (
    <table className={s.keys}>
      <caption className="visually-hidden">키보드 단축키</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={v}>
            <th scope="row">
              <kbd>{k}</kbd>
            </th>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
