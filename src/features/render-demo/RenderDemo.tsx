"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import s from "./render-demo.module.css";

/**
 * PlotPlan의 선택 렌더링 문제를 축소한 데모.
 * - array: 각 노드가 선택 배열 전체를 구독 → 선택이 바뀔 때마다 새 배열 참조로 전 노드 다시 렌더링
 * - boolean: 각 노드가 자기 선택 여부만 구독 → 값이 바뀐 노드만 다시 렌더링
 * 어느 쪽이든 부모는 다시 렌더링되지 않으므로, 차이는 구독 범위에서만 생긴다.
 */

const COLS = 16;
const ROWS = 9;
const NODE_IDS = Array.from({ length: COLS * ROWS }, (_, i) => `N${i}`);

type Mode = "array" | "boolean";

function createSelectionStore() {
  let selected: readonly string[] = [];
  const listeners = new Set<() => void>();
  return {
    subscribe: (l: () => void) => (listeners.add(l), () => listeners.delete(l)),
    get: () => selected,
    select(id: string) {
      // 실제 코드처럼 선택이 바뀔 때마다 새 배열 생성
      selected = [id];
      listeners.forEach((l) => l());
    },
  };
}

function createRenderCounter() {
  let total = 0;
  let lastClick = 0;
  let scheduled = false;
  const listeners = new Set<() => void>();
  const notify = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      listeners.forEach((l) => l());
    });
  };
  return {
    subscribe: (l: () => void) => (listeners.add(l), () => listeners.delete(l)),
    total: () => total,
    lastClick: () => lastClick,
    startClick() {
      lastClick = 0;
    },
    add() {
      total += 1;
      lastClick += 1;
      notify();
    },
  };
}

type Selection = ReturnType<typeof createSelectionStore>;
type Counter = ReturnType<typeof createRenderCounter>;

/** 렌더가 commit될 때마다 카운트하고 노드를 잠깐 강조 */
function useRenderFlash(counter: Counter) {
  const ref = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    counter.add();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // WAAPI keyframe에는 CSS 변수를 직접 쓸 수 없어 현재 테마의 값을 읽어 사용
    const flash = getComputedStyle(document.documentElement).getPropertyValue("--color-danger").trim();
    ref.current?.animate(
      [{ backgroundColor: flash, transform: "scale(0.86)" }, { backgroundColor: "transparent", transform: "none" }],
      { duration: reduce ? 0 : 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  });
  return ref;
}

function ArrayNode({ id, selection, counter }: { id: string; selection: Selection; counter: Counter }) {
  const selectedItems = useSyncExternalStore(selection.subscribe, selection.get, selection.get);
  const isSelected = selectedItems.includes(id);
  const ref = useRenderFlash(counter);
  return <NodeButton ref={ref} id={id} selected={isSelected} selection={selection} counter={counter} />;
}

function BooleanNode({ id, selection, counter }: { id: string; selection: Selection; counter: Counter }) {
  const isSelected = useSyncExternalStore(
    selection.subscribe,
    () => selection.get().includes(id),
    () => false,
  );
  const ref = useRenderFlash(counter);
  return <NodeButton ref={ref} id={id} selected={isSelected} selection={selection} counter={counter} />;
}

function NodeButton({
  ref,
  id,
  selected,
  selection,
  counter,
}: {
  ref: React.Ref<HTMLButtonElement>;
  id: string;
  selected: boolean;
  selection: Selection;
  counter: Counter;
}) {
  return (
    <button
      ref={ref}
      type="button"
      className={s.node}
      aria-pressed={selected}
      aria-label={`노드 ${id}`}
      onClick={() => {
        counter.startClick();
        selection.select(id);
      }}
    />
  );
}

/** 카운터를 구독하는 쪽은 노드의 부모가 아닌 형제여야 함. 부모가 구독하면 카운트할 때마다 전체 노드가 다시 렌더링 */
function Stats({ counter, mode }: { counter: Counter; mode: Mode }) {
  const total = useSyncExternalStore(counter.subscribe, counter.total, () => 0);
  const lastClick = useSyncExternalStore(counter.subscribe, counter.lastClick, () => 0);
  return (
    <dl className={s.stats} aria-live="polite">
      <div>
        <dt>마지막 클릭의 render</dt>
        <dd data-mode={mode}>{lastClick.toLocaleString("ko-KR")}회</dd>
      </div>
      <div>
        <dt>누적 render</dt>
        <dd>{total.toLocaleString("ko-KR")}회</dd>
      </div>
    </dl>
  );
}

function Grid({ mode }: { mode: Mode }) {
  const [selection] = useState(createSelectionStore);
  const [counter] = useState(createRenderCounter);
  const Node = mode === "array" ? ArrayNode : BooleanNode;

  return (
    <>
      <div className={s.grid} style={{ "--cols": COLS } as React.CSSProperties}>
        {NODE_IDS.map((id) => (
          <Node key={id} id={id} selection={selection} counter={counter} />
        ))}
      </div>
      <Stats counter={counter} mode={mode} />
    </>
  );
}

export function RenderDemo() {
  const [mode, setMode] = useState<Mode>("array");

  return (
    <figure className={s.demo}>
      <div className={s.head}>
        <div className={s.segmented} role="radiogroup" aria-label="구독 방식">
          {(
            [
              ["array", "수정 전: 선택 배열 구독"],
              ["boolean", "수정 후: 선택 여부 구독"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Grid key={mode} mode={mode} />
      <figcaption className={s.caption}>
        노드 {NODE_IDS.length}개 데모. 실제 측정은 장비 768개, CanvasNode 1,675개 장면에서 클릭당 2,340회 → 1회. 이 데모에서는 이전 선택이 풀리는 노드까지 포함해 수정 후 2회.
      </figcaption>
    </figure>
  );
}
