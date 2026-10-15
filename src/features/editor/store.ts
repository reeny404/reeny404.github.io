"use client";

import { useSyncExternalStore } from "react";
import { history } from "@/features/command/history";

/**
 * 첫 화면 미니 에디터(도형 편집)의 상태.
 * - document: 저장 대상인 편집 데이터. command를 통해서만 바뀐다.
 * - view: 선택, 드래그와 회전 중 미리보기처럼 저장하지 않는 화면 상태.
 * 위치는 중심 좌표로 저장해 회전이 각도 하나만 바꾸도록 한다.
 */

export type Shape = {
  id: string;
  kind: "rect" | "ellipse" | "star" | "triangle" | "text";
  /** 레이어 이름. command 기록과 접근성 이름에 사용 */
  name: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** 0 이상 360 미만의 도 */
  rotation: number;
};

export const GRID = 20;
export const BOARD = { w: 520, h: 340 } as const;

const initial: Shape[] = [
  { id: "rect", kind: "rect", name: "사각형", cx: 120, cy: 120, w: 120, h: 84, rotation: 0 },
  { id: "ellipse", kind: "ellipse", name: "원", cx: 270, cy: 100, w: 92, h: 92, rotation: 0 },
  { id: "star", kind: "star", name: "별", cx: 410, cy: 120, w: 104, h: 100, rotation: 0 },
  { id: "text", kind: "text", name: "텍스트", cx: 200, cy: 250, w: 150, h: 56, rotation: 0 },
  { id: "triangle", kind: "triangle", name: "삼각형", cx: 360, cy: 240, w: 84, h: 72, rotation: 0 },
];

type Doc = Record<string, Shape>;
type Preview = { id: string; dx: number; dy: number; rotation?: number };
type View = { selected: string | null; preview: Preview | null };

let doc: Doc = Object.fromEntries(initial.map((e) => [e.id, e]));
let view: View = { selected: null, preview: null };
const docListeners = new Set<() => void>();
const viewListeners = new Set<() => void>();

const subscribeDoc = (l: () => void) => (docListeners.add(l), () => docListeners.delete(l));
const subscribeView = (l: () => void) => (viewListeners.add(l), () => viewListeners.delete(l));

function patch(id: string, next: Partial<Shape>) {
  doc = { ...doc, [id]: { ...doc[id], ...next } };
  docListeners.forEach((l) => l());
}

function setView(next: Partial<View>) {
  view = { ...view, ...next };
  viewListeners.forEach((l) => l());
}

export const ids = initial.map((e) => e.id);
const initialDoc = doc;

export const normalizeAngle = (deg: number) => ((Math.round(deg) % 360) + 360) % 360;

/** 회전을 반영한 축 정렬 경계 상자의 크기 */
export function bounds(e: Pick<Shape, "w" | "h" | "rotation">) {
  const r = (e.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));
  return { w: e.w * cos + e.h * sin, h: e.w * sin + e.h * cos };
}

/** 회전한 도형이 보드 밖으로 나가지 않도록 중심 좌표 제한 */
export function clampCenter(e: Shape, cx: number, cy: number, rotation = e.rotation) {
  const b = bounds({ ...e, rotation });
  return {
    cx: Math.min(Math.max(b.w / 2, cx), BOARD.w - b.w / 2),
    cy: Math.min(Math.max(b.h / 2, cy), BOARD.h - b.h / 2),
  };
}

export const snap = (v: number) => Math.round(v / GRID) * GRID;

export const editor = {
  get: (id: string) => doc[id],
  select(id: string | null) {
    if (view.selected !== id) setView({ selected: id });
  },
  previewMove(id: string, dx: number, dy: number) {
    setView({ preview: { id, dx, dy } });
  },
  previewRotation(id: string, rotation: number) {
    setView({ preview: { id, dx: 0, dy: 0, rotation } });
  },
  clearPreview() {
    if (view.preview) setView({ preview: null });
  },
  move(id: string, to: { cx: number; cy: number }) {
    const e = doc[id];
    const from = { cx: e.cx, cy: e.cy };
    if (from.cx === to.cx && from.cy === to.cy) return;
    const fmt = (p: { cx: number; cy: number }) => `(${Math.round(p.cx)}, ${Math.round(p.cy)})`;
    history.execute({
      label: `${e.name} 이동 ${fmt(from)} → ${fmt(to)}`,
      scope: "editor",
      do: () => patch(id, to),
      undo: () => patch(id, from),
    });
  },
  /** 중심 기준 회전. 회전 후 보드 밖으로 나가면 중심을 안쪽으로 옮김 */
  rotate(id: string, rotation: number) {
    const e = doc[id];
    const to = normalizeAngle(rotation);
    if (to === e.rotation) return;
    const from = { rotation: e.rotation, cx: e.cx, cy: e.cy };
    const center = clampCenter(e, e.cx, e.cy, to);
    history.execute({
      label: `${e.name} 회전 ${from.rotation}° → ${to}°`,
      scope: "editor",
      do: () => patch(id, { rotation: to, ...center }),
      undo: () => patch(id, from),
    });
  },
  /** 처음 배치로 되돌림. 이것도 command라서 다시 ⌘Z로 직전 배치 복구 가능 */
  reset() {
    const before = doc;
    if (before === initialDoc) return;
    const replace = (next: Doc) => {
      doc = next;
      docListeners.forEach((l) => l());
    };
    history.execute({
      label: "배치 초기화",
      scope: "editor",
      do: () => replace(initialDoc),
      undo: () => replace(before),
    });
  },
};

export function useIsPristine() {
  return useSyncExternalStore(subscribeDoc, () => doc === initialDoc, () => true);
}

export function useShape(id: string) {
  return useSyncExternalStore(subscribeDoc, () => doc[id], () => initialDoc[id]);
}

export function useIsSelected(id: string) {
  return useSyncExternalStore(subscribeView, () => view.selected === id, () => false);
}

export function useSelectedId() {
  return useSyncExternalStore(subscribeView, () => view.selected, () => null);
}

/** 이 도형의 미리보기. 다른 도형이 드래그될 때는 같은 null을 돌려 다시 렌더링하지 않는다 */
export function usePreview(id: string) {
  return useSyncExternalStore(
    subscribeView,
    () => (view.preview?.id === id ? view.preview : null),
    () => null,
  );
}
