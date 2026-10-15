"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** 서버 렌더에서는 Mac 표기로 그리고, 클라이언트에서 실제 플랫폼으로 교체 */
export function useIsMac() {
  return useSyncExternalStore(
    subscribeNoop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
}

/** 화면에 보여 줄 단축키 표기. 실행 취소, 다시 실행, 팔레트가 모두 같은 표기를 쓰도록 한곳에서 관리 */
export function useShortcutLabels() {
  const mac = useIsMac();
  return mac
    ? { palette: "⌘K", undo: "⌘Z", redo: "⇧⌘Z" }
    : { palette: "Ctrl K", undo: "Ctrl Z", redo: "Ctrl Y" };
}
