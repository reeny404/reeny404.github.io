"use client";

import { useSyncExternalStore } from "react";

/**
 * 사이트 전역 command history.
 * PlotPlan 에디터 V2와 같은 규칙: 상태를 바꾸는 조작은 모두 command를 통과하고,
 * 실행 취소는 별도 기능이 아니라 command의 undo로 처리한다.
 */

export type Command = {
  /** 기록과 토스트에 표시되는 이름 */
  label: string;
  /** 어느 기능에서 만든 command인지. 기록 패널 필터용 */
  scope: "site" | "editor";
  do(): void;
  undo(): void;
};

type Snapshot = {
  past: readonly Command[];
  future: readonly Command[];
  /** 마지막 undo/redo 결과. 토스트 표시용 */
  last: { kind: "do" | "undo" | "redo"; label: string; scope: Command["scope"]; at: number } | null;
};

const LIMIT = 100;
let state: Snapshot = { past: [], future: [], last: null };
const listeners = new Set<() => void>();

function set(next: Snapshot) {
  state = next;
  listeners.forEach((l) => l());
}

export const history = {
  execute(command: Command) {
    command.do();
    set({
      past: [...state.past, command].slice(-LIMIT),
      future: [],
      last: { kind: "do", label: command.label, scope: command.scope, at: Date.now() },
    });
  },
  /** 이미 화면에 반영된 변경(드래그 종료 등)을 기록만 한다 */
  record(command: Command) {
    set({
      past: [...state.past, command].slice(-LIMIT),
      future: [],
      last: { kind: "do", label: command.label, scope: command.scope, at: Date.now() },
    });
  },
  undo() {
    const command = state.past.at(-1);
    if (!command) return false;
    command.undo();
    set({
      past: state.past.slice(0, -1),
      future: [command, ...state.future],
      last: { kind: "undo", label: command.label, scope: command.scope, at: Date.now() },
    });
    return true;
  },
  redo() {
    const [command, ...rest] = state.future;
    if (!command) return false;
    command.do();
    set({
      past: [...state.past, command],
      future: rest,
      last: { kind: "redo", label: command.label, scope: command.scope, at: Date.now() },
    });
    return true;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
};

const serverSnapshot: Snapshot = { past: [], future: [], last: null };

export function useHistory<T>(selector: (s: Snapshot) => T): T {
  return useSyncExternalStore(
    history.subscribe,
    () => selector(state),
    () => selector(serverSnapshot),
  );
}
