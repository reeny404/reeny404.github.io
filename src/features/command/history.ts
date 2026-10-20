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
  last: { kind: "do" | "undo" | "redo" | "travel"; label: string; scope: Command["scope"]; at: number } | null;
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
  /**
   * 기록의 index번째 지점(실행한 command 수)으로 한 번에 이동. 되감기 슬라이더용.
   * 사이의 command를 차례로 undo/redo하고 알림은 마지막에 한 번만 보낸다.
   */
  travel(index: number) {
    const past = [...state.past];
    const future = [...state.future];
    const target = Math.min(Math.max(0, Math.round(index)), past.length + future.length);
    if (target === past.length) return;
    while (past.length > target) {
      const command = past.pop()!;
      command.undo();
      future.unshift(command);
    }
    while (past.length < target) {
      const command = future.shift()!;
      command.do();
      past.push(command);
    }
    const at = past.at(-1) ?? future[0];
    set({ past, future, last: { kind: "travel", label: at.label, scope: at.scope, at: Date.now() } });
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
