"use client";

import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

export const palette = {
  open() {
    open = true;
    listeners.forEach((l) => l());
  },
  close() {
    open = false;
    listeners.forEach((l) => l());
  },
  toggle() {
    if (open) palette.close();
    else palette.open();
  },
};

export function usePaletteOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );
}

/** 입력 중인 요소에서는 전역 단축키를 가로채지 않는다 */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}
