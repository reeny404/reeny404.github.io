"use client";

import { useSyncExternalStore } from "react";
import { history } from "@/features/command/history";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "theme";
const LABEL: Record<ThemeChoice, string> = {
  light: "라이트",
  dark: "다크",
  system: "시스템 설정",
};

/** 첫 paint 전에 실행되는 인라인 스크립트. 저장된 테마를 <html data-theme>에 반영 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

export function resolvedTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function write(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {}
  listeners.forEach((l) => l());
}

/** View Transitions API가 있으면 원점에서 퍼지는 전환, 없으면 즉시 적용 */
function applyWithTransition(choice: ThemeChoice, origin?: { x: number; y: number }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || resolvedTheme(choice) === resolvedTheme(readChoice())) {
    write(choice);
    return;
  }
  const root = document.documentElement;
  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 28;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.dataset.vt = "theme";
  const t = document.startViewTransition(() => write(choice));
  t.finished.finally(() => delete root.dataset.vt);
}

export function setTheme(next: ThemeChoice, origin?: { x: number; y: number }) {
  const prev = readChoice();
  if (prev === next) return;
  history.execute({
    label: `테마 ${LABEL[prev]} → ${LABEL[next]}`,
    scope: "site",
    do: () => applyWithTransition(next, origin),
    undo: () => applyWithTransition(prev, origin),
  });
}

export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", l);
      return () => {
        listeners.delete(l);
        mq.removeEventListener("change", l);
      };
    },
    readChoice,
    () => "system",
  );
}
