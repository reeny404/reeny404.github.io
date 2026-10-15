"use client";

import { memo, useRef } from "react";
import { Button } from "@/components/ui";
import { history, useHistory } from "@/features/command/history";
import {
  BOARD,
  GRID,
  PIPES,
  clampToBoard,
  editor,
  footprint,
  ids,
  snap,
  useEquipment,
  useIsSelected,
  usePreviewOffset,
  useSelectedId,
  type Equipment,
} from "./store";
import s from "./editor.module.css";

function usePlacement(id: string) {
  const e = useEquipment(id);
  const preview = usePreviewOffset(id);
  const { w, h } = footprint(e);
  const x = e.x + (preview?.dx ?? 0);
  const y = e.y + (preview?.dy ?? 0);
  return { e, x, y, w, h, dragging: preview !== null };
}

function Glyph({ e }: { e: Equipment }) {
  switch (e.kind) {
    case "tank":
      return <rect width={e.w} height={e.h} rx={e.w / 2} className={s.body} />;
    case "vessel":
      return <rect width={e.w} height={e.h} rx={e.w / 2.4} className={s.body} />;
    case "pump":
      return (
        <>
          <rect width={e.w} height={e.h} rx={6} className={s.body} />
          <circle cx={e.h / 2} cy={e.h / 2} r={e.h / 2 - 8} className={s.detail} />
        </>
      );
    case "exchanger":
      return (
        <>
          <rect width={e.w} height={e.h} rx={e.h / 2} className={s.body} />
          <path
            d={`M14 ${e.h / 2} l8 -8 l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -8`}
            className={s.detail}
          />
        </>
      );
  }
}

const Item = memo(function Item({ id }: { id: string }) {
  const { e, x, y, w, h, dragging } = usePlacement(id);
  const selected = useIsSelected(id);
  const drag = useRef<{ px: number; py: number; scale: number; moved: boolean } | null>(null);

  const onPointerDown = (ev: React.PointerEvent<SVGGElement>) => {
    if (ev.button !== 0) return;
    const svg = ev.currentTarget.ownerSVGElement!;
    const scale = svg.viewBox.baseVal.width / svg.getBoundingClientRect().width;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    drag.current = { px: ev.clientX, py: ev.clientY, scale, moved: false };
    editor.select(id);
  };

  const onPointerMove = (ev: React.PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = { dx: (ev.clientX - d.px) * d.scale, dy: (ev.clientY - d.py) * d.scale };
    if (!d.moved && Math.hypot(raw.dx, raw.dy) < 4) return;
    d.moved = true;
    const to = clampToBoard(e, e.x + snap(raw.dx), e.y + snap(raw.dy));
    editor.preview(id, to.x - e.x, to.y - e.y);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // 드래그 중에는 화면 상태만 바뀌고, 놓는 순간 command 하나로 document에 반영
    editor.move(id, { x, y });
    editor.clearPreview();
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    const step = ev.shiftKey ? GRID * 2 : GRID;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (delta[ev.key]) {
      ev.preventDefault();
      const [dx, dy] = delta[ev.key];
      editor.move(id, clampToBoard(e, e.x + dx, e.y + dy));
    } else if (ev.key.toLowerCase() === "r" && !ev.metaKey && !ev.ctrlKey) {
      ev.preventDefault();
      editor.rotate(id);
    } else if (ev.key === "Escape") {
      editor.select(null);
      (ev.currentTarget as SVGGElement).blur();
    }
  };

  return (
    <g
      className={s.item}
      data-selected={selected}
      data-dragging={dragging}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${e.id} ${e.name}, 위치 ${e.x} ${e.y}, ${e.rotation}도`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        editor.clearPreview();
      }}
      onFocus={() => editor.select(id)}
      onKeyDown={onKeyDown}
    >
      <g transform={`translate(${(w - e.w) / 2} ${(h - e.h) / 2}) rotate(${e.rotation} ${e.w / 2} ${e.h / 2})`}>
        <Glyph e={e} />
      </g>
      <rect className={s.selection} x={-4} y={-4} width={w + 8} height={h + 8} rx={6} />
      <text className={s.label} x={w / 2} y={h + 16} textAnchor="middle">
        {e.id}
      </text>
    </g>
  );
});

const Pipe = memo(function Pipe({ from, to }: { from: string; to: string }) {
  const a = usePlacement(from);
  const b = usePlacement(to);
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;
  const mid = (ax + bx) / 2;
  return <path className={s.pipe} d={`M${ax} ${ay} H${mid} V${by} H${bx}`} />;
});

function Inspector() {
  const selectedId = useSelectedId();
  return selectedId ? <SelectedDoc id={selectedId} /> : <p className={s.empty}>장비를 선택하면 document 값 표시</p>;
}

function SelectedDoc({ id }: { id: string }) {
  const e = useEquipment(id);
  const json = `{ "id": "${e.id}", "x": ${e.x}, "y": ${e.y}, "rotation": ${e.rotation} }`;
  return <code className={s.json}>{json}</code>;
}

function CommandLog() {
  const past = useHistory((h) => h.past);
  const entries = past.filter((c) => c.scope === "editor").slice(-4).reverse();
  return (
    <ol className={s.log} aria-label="최근 command">
      {entries.length === 0 ? (
        <li className={s.empty}>아직 실행한 command 없음</li>
      ) : (
        entries.map((c, i) => (
          <li key={`${past.length}-${i}`} data-latest={i === 0}>
            {c.label}
          </li>
        ))
      )}
    </ol>
  );
}

function Toolbar() {
  const selectedId = useSelectedId();
  const canUndo = useHistory((h) => h.past.length > 0);
  const canRedo = useHistory((h) => h.future.length > 0);
  return (
    <div className={s.toolbar} role="toolbar" aria-label="에디터 도구">
      <Button size="sm" disabled={!selectedId} onClick={() => selectedId && editor.rotate(selectedId)}>
        회전 <kbd>R</kbd>
      </Button>
      <Button size="sm" disabled={!canUndo} onClick={() => history.undo()}>
        실행 취소 <kbd>⌘Z</kbd>
      </Button>
      <Button size="sm" disabled={!canRedo} onClick={() => history.redo()}>
        다시 실행
      </Button>
      <Button size="sm" variant="ghost" onClick={() => editor.reset()}>
        초기화
      </Button>
    </div>
  );
}

export function MiniEditor() {
  return (
    <figure className={s.editor}>
      <Toolbar />
      <div className={s.board}>
        <svg
          viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
          className={s.svg}
          role="group"
          aria-label="장비 배치 데모. 장비를 드래그하거나 선택 후 방향키로 이동, R로 회전"
          onPointerDown={(ev) => ev.target === ev.currentTarget && editor.select(null)}
        >
          <defs>
            <pattern id="grid-dot" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={1} className={s.dot} />
            </pattern>
          </defs>
          <rect width={BOARD.w} height={BOARD.h} fill="url(#grid-dot)" pointerEvents="none" />
          {PIPES.map(([a, b]) => (
            <Pipe key={`${a}-${b}`} from={a} to={b} />
          ))}
          {ids.map((id) => (
            <Item key={id} id={id} />
          ))}
        </svg>
      </div>
      <div className={s.panels}>
        <div>
          <span className={s.panelTitle}>Document</span>
          <Inspector />
        </div>
        <div>
          <span className={s.panelTitle}>Command</span>
          <CommandLog />
        </div>
      </div>
      <figcaption className={s.caption}>
        드래그 중에는 화면 상태만 바뀌고, 놓는 순간 command 하나로 document에 반영. PlotPlan 에디터 V2 구조를 축소한 데모.
      </figcaption>
    </figure>
  );
}
