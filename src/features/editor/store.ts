"use client";

import { useSyncExternalStore } from "react";
import { history } from "@/features/command/history";

/**
 * 첫 화면 미니 에디터의 상태.
 * - document: 저장 대상인 편집 데이터. command를 통해서만 바뀐다.
 * - view: 드래그 중 미리보기처럼 저장하지 않는 화면 상태.
 * 각 컴포넌트는 필요한 값만 구독한다(장비는 자기 자신과 선택 여부 boolean).
 */

export type Equipment = {
  id: string;
  kind: "tank" | "pump" | "exchanger" | "vessel";
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: 0 | 90 | 180 | 270;
};

export const GRID = 20;
export const BOARD = { w: 520, h: 340 } as const;

const initial: Equipment[] = [
  { id: "T-101", kind: "tank", name: "원료 탱크", x: 40, y: 60, w: 80, h: 80, rotation: 0 },
  { id: "P-101", kind: "pump", name: "이송 펌프", x: 180, y: 80, w: 60, h: 40, rotation: 0 },
  { id: "E-201", kind: "exchanger", name: "열교환기", x: 300, y: 60, w: 100, h: 40, rotation: 0 },
  { id: "V-301", kind: "vessel", name: "분리기", x: 400, y: 180, w: 60, h: 100, rotation: 0 },
  { id: "P-102", kind: "pump", name: "순환 펌프", x: 220, y: 240, w: 60, h: 40, rotation: 0 },
];

export const PIPES: [string, string][] = [
  ["T-101", "P-101"],
  ["P-101", "E-201"],
  ["E-201", "V-301"],
  ["V-301", "P-102"],
];

type Doc = Record<string, Equipment>;
type View = { selected: string | null; preview: { id: string; dx: number; dy: number } | null };

let doc: Doc = Object.fromEntries(initial.map((e) => [e.id, e]));
let view: View = { selected: null, preview: null };
const docListeners = new Set<() => void>();
const viewListeners = new Set<() => void>();

const subscribeDoc = (l: () => void) => (docListeners.add(l), () => docListeners.delete(l));
const subscribeView = (l: () => void) => (viewListeners.add(l), () => viewListeners.delete(l));

function patch(id: string, next: Partial<Equipment>) {
  doc = { ...doc, [id]: { ...doc[id], ...next } };
  docListeners.forEach((l) => l());
}

function setView(next: Partial<View>) {
  view = { ...view, ...next };
  viewListeners.forEach((l) => l());
}

export const ids = initial.map((e) => e.id);
const initialDoc = doc;

export const editor = {
  get: (id: string) => doc[id],
  select(id: string | null) {
    if (view.selected !== id) setView({ selected: id });
  },
  preview(id: string, dx: number, dy: number) {
    setView({ preview: { id, dx, dy } });
  },
  clearPreview() {
    if (view.preview) setView({ preview: null });
  },
  move(id: string, to: { x: number; y: number }) {
    const from = { x: doc[id].x, y: doc[id].y };
    if (from.x === to.x && from.y === to.y) return;
    history.execute({
      label: `${id} 이동 (${from.x}, ${from.y}) → (${to.x}, ${to.y})`,
      scope: "editor",
      do: () => patch(id, to),
      undo: () => patch(id, from),
    });
  },
  rotate(id: string) {
    const from = doc[id].rotation;
    const to = ((from + 90) % 360) as Equipment["rotation"];
    history.execute({
      label: `${id} 회전 ${from}° → ${to}°`,
      scope: "editor",
      do: () => patch(id, { rotation: to }),
      undo: () => patch(id, { rotation: from }),
    });
  },
  reset() {
    const before = doc;
    if (before === initialDoc) return;
    history.execute({
      label: "배치 초기화",
      scope: "editor",
      do: () => {
        doc = initialDoc;
        docListeners.forEach((l) => l());
      },
      undo: () => {
        doc = before;
        docListeners.forEach((l) => l());
      },
    });
  },
};

export const snap = (v: number) => Math.round(v / GRID) * GRID;

/** 회전을 반영한 화면상의 크기 */
export function footprint(e: Equipment) {
  return e.rotation % 180 === 0 ? { w: e.w, h: e.h } : { w: e.h, h: e.w };
}

export function clampToBoard(e: Equipment, x: number, y: number) {
  const { w, h } = footprint(e);
  return {
    x: Math.min(Math.max(0, x), BOARD.w - w),
    y: Math.min(Math.max(0, y), BOARD.h - h),
  };
}

export function useEquipment(id: string) {
  return useSyncExternalStore(subscribeDoc, () => doc[id], () => initialDoc[id]);
}

export function useIsSelected(id: string) {
  return useSyncExternalStore(subscribeView, () => view.selected === id, () => false);
}

export function useSelectedId() {
  return useSyncExternalStore(subscribeView, () => view.selected, () => null);
}

/** 이 장비의 드래그 미리보기 오프셋. 다른 장비가 드래그될 때는 같은 null을 돌려 다시 렌더링하지 않는다 */
export function usePreviewOffset(id: string) {
  return useSyncExternalStore(
    subscribeView,
    () => (view.preview?.id === id ? view.preview : null),
    () => null,
  );
}
