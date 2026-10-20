"use client";

import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { history, useHistory } from "@/features/command/history";
import { useShortcutLabels } from "@/features/command/shortcuts";
import {
  BOARD,
  GRID,
  clampCenter,
  editor,
  ids,
  normalizeAngle,
  snap,
  useIsPristine,
  useIsSelected,
  usePreview,
  useShape,
  type Shape,
} from "./store";
import { Timeline } from "./Timeline";
import s from "./editor.module.css";

/** document 값에 드래그, 회전 미리보기를 더한 화면상의 배치 */
function usePlacement(id: string) {
  const e = useShape(id);
  const preview = usePreview(id);
  return {
    e,
    cx: e.cx + (preview?.dx ?? 0),
    cy: e.cy + (preview?.dy ?? 0),
    rotation: preview?.rotation ?? e.rotation,
    dragging: preview !== null && preview.rotation === undefined,
    rotating: preview?.rotation !== undefined,
  };
}

/**
 * 화면에 그리는 누적 각도. 0°와 350°처럼 경계를 넘을 때 거꾸로 한 바퀴 돌지 않도록
 * 직전 값과의 가장 짧은 차이만큼만 더한다.
 */
function useDisplayAngle(rotation: number) {
  const [prev, setPrev] = useState(rotation);
  const [angle, setAngle] = useState(rotation);
  if (rotation !== prev) {
    setPrev(rotation);
    setAngle(angle + ((((rotation - prev) % 360) + 540) % 360) - 180);
  }
  return angle;
}

function toBoardPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

function starPath(w: number, h: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 1 : 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(w / 2 + (w / 2) * r * Math.cos(a)).toFixed(1)} ${(h / 2 + (h / 2) * r * Math.sin(a) + h * 0.04).toFixed(1)}`;
  });
  return `M${points.join(" L")} Z`;
}

/** 원점이 왼쪽 위인 w × h 영역에 도형을 그림. 404 보드에서도 같은 모양을 씀 */
export function Glyph({ e }: { e: Shape }) {
  switch (e.kind) {
    case "rect":
      return <rect width={e.w} height={e.h} rx={14} className={`${s.body} ${s.fillAccent}`} />;
    case "ellipse":
      return <ellipse cx={e.w / 2} cy={e.h / 2} rx={e.w / 2} ry={e.h / 2} className={`${s.body} ${s.fillCoral}`} />;
    case "star":
      return <path d={starPath(e.w, e.h)} className={`${s.body} ${s.fillYellow} ${s.rounded}`} />;
    case "triangle":
      return <path d={`M${e.w / 2} 4 L${e.w - 4} ${e.h - 4} L4 ${e.h - 4} Z`} className={`${s.body} ${s.fillInk} ${s.rounded}`} />;
    case "text":
      return (
        <>
          <rect width={e.w} height={e.h} rx={e.h / 2} className={`${s.body} ${s.fillMint}`} />
          <text x={e.w / 2} y={e.h / 2} className={s.shapeText} textAnchor="middle" dominantBaseline="central">
            Hello
          </text>
        </>
      );
  }
}

const HANDLE_GAP = 22;

const Item = memo(function Item({ id }: { id: string }) {
  const { e, cx, cy, rotation, dragging, rotating } = usePlacement(id);
  const selected = useIsSelected(id);
  const angle = useDisplayAngle(rotation);
  const drag = useRef<{ px: number; py: number; scale: number; moved: boolean } | null>(null);
  const spin = useRef<{ startPointer: number; startRotation: number; last: number } | null>(null);

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
    const to = clampCenter(e, e.cx + snap(raw.dx), e.cy + snap(raw.dy));
    editor.previewMove(id, to.cx - e.cx, to.cy - e.cy);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // 드래그 중에는 화면 상태만 바뀌고, 놓는 순간 command 하나로 document에 반영
    editor.move(id, { cx, cy });
    editor.clearPreview();
  };

  // 회전 핸들: 중심에서 포인터까지의 각도 변화만큼 회전. Shift를 누르면 15도 단위
  const pointerAngle = (ev: React.PointerEvent<SVGElement>) => {
    const p = toBoardPoint(ev.currentTarget.ownerSVGElement!, ev.clientX, ev.clientY);
    return (Math.atan2(p.y - e.cy, p.x - e.cx) * 180) / Math.PI;
  };

  const onHandleDown = (ev: React.PointerEvent<SVGGElement>) => {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    spin.current = { startPointer: pointerAngle(ev), startRotation: e.rotation, last: e.rotation };
  };

  const onHandleMove = (ev: React.PointerEvent<SVGGElement>) => {
    const r = spin.current;
    if (!r) return;
    ev.stopPropagation();
    let next = r.startRotation + (pointerAngle(ev) - r.startPointer);
    if (ev.shiftKey) next = Math.round(next / 15) * 15;
    r.last = normalizeAngle(next);
    editor.previewRotation(id, r.last);
  };

  const onHandleUp = (ev: React.PointerEvent<SVGGElement>) => {
    const r = spin.current;
    spin.current = null;
    if (!r) return;
    ev.stopPropagation();
    editor.rotate(id, r.last);
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
      editor.move(id, clampCenter(e, e.cx + dx, e.cy + dy));
    } else if (ev.key.toLowerCase() === "r" && !ev.metaKey && !ev.ctrlKey) {
      ev.preventDefault();
      editor.rotate(id, e.rotation + (ev.shiftKey ? -90 : 90));
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
      data-rotating={rotating}
      style={{ transform: `translate(${cx}px, ${cy}px)` }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${e.name}, 위치 ${Math.round(e.cx)} ${Math.round(e.cy)}, ${e.rotation}도`}
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
      {/* 원점이 도형 중심이므로 rotate 하나로 중심 기준 회전 */}
      <g className={s.shape} style={{ transform: `rotate(${angle}deg)` }}>
        <g transform={`translate(${-e.w / 2} ${-e.h / 2})`}>
          <Glyph e={e} />
        </g>
        <rect className={s.selection} x={-e.w / 2 - 4} y={-e.h / 2 - 4} width={e.w + 8} height={e.h + 8} rx={6} />
        {selected && (
          <g
            className={s.handle}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={() => {
              spin.current = null;
              editor.clearPreview();
            }}
          >
            <line x1={0} y1={-e.h / 2 - 4} x2={0} y2={-e.h / 2 - HANDLE_GAP} className={s.handleLine} />
            {/* 터치 영역은 넓게, 보이는 점은 작게 */}
            <circle cx={0} cy={-e.h / 2 - HANDLE_GAP - 6} r={14} className={s.handleHit} />
            <circle cx={0} cy={-e.h / 2 - HANDLE_GAP - 6} r={5} className={s.handleDot} />
          </g>
        )}
      </g>
    </g>
  );
});

/** 조작한 뒤에만 마지막 command 표시 */
function StatusBar() {
  const past = useHistory((h) => h.past);
  const editorCommands = past.filter((c) => c.scope === "editor");
  const last = editorCommands.at(-1);
  return (
    <p className={s.status} aria-live="polite">
      {last && (
        <>
          <span className={s.badge}>{editorCommands.length}</span>
          <span key={editorCommands.length} className={s.lastCommand}>
            {last.label}
          </span>
        </>
      )}
    </p>
  );
}

function IconButton({
  label,
  shortcut,
  hint,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  /** 툴팁에 함께 보일 단축키 표기 */
  hint?: string;
  disabled?: boolean;
  onClick(): void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      icon
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={hint ? `${label} (${hint})` : label}
      disabled={disabled}
      onClick={onClick}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </Button>
  );
}

function HistoryControls() {
  const canUndo = useHistory((h) => h.past.length > 0);
  const canRedo = useHistory((h) => h.future.length > 0);
  const keys = useShortcutLabels();
  return (
    <div className={s.historyControls}>
      <IconButton label="실행 취소" shortcut="Meta+Z Control+Z" hint={keys.undo} disabled={!canUndo} onClick={() => history.undo()}>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
      </IconButton>
      <IconButton label="다시 실행" shortcut="Meta+Shift+Z Control+Y" hint={keys.redo} disabled={!canRedo} onClick={() => history.redo()}>
        <path d="m15 14 5-5-5-5" />
        <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
      </IconButton>
    </div>
  );
}

function ResetButton() {
  const pristine = useIsPristine();
  return (
    <div className={s.resetControl}>
      <IconButton label="처음 배치로" disabled={pristine} onClick={() => editor.reset()}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </IconButton>
    </div>
  );
}

const ZOOM = { min: 0.8, max: 1.6 } as const;
type Viewport = { x: number; y: number; zoom: number };

/** 축 하나의 보이는 범위. 보드보다 작으면 보드 안에 머물고, 보드보다 크면 가운데 정렬 */
function clampAxis(start: number, visible: number, total: number) {
  if (visible >= total) return (total - visible) / 2;
  return Math.min(Math.max(0, start), total - visible);
}

/**
 * 휠로 커서 위치를 기준으로 확대, 축소. 화면 전용 상태라 command로 기록하지 않음.
 * 에디터 위에서는 줌 한계에 닿아도 페이지가 스크롤되지 않도록 항상 기본 동작을 막음.
 */
function useWheelZoom() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const zoomRef = useRef(viewport.zoom);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const current = zoomRef.current;
      const next = Math.min(ZOOM.max, Math.max(ZOOM.min, current * Math.exp(-ev.deltaY * 0.0015)));
      if (next === current) return;
      const p = toBoardPoint(svg, ev.clientX, ev.clientY);
      zoomRef.current = next;
      setViewport((v) => {
        const prevW = BOARD.w / v.zoom;
        const prevH = BOARD.h / v.zoom;
        const w = BOARD.w / next;
        const h = BOARD.h / next;
        return {
          zoom: next,
          x: clampAxis(p.x - ((p.x - v.x) / prevW) * w, w, BOARD.w),
          y: clampAxis(p.y - ((p.y - v.y) / prevH) * h, h, BOARD.h),
        };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const viewBox = `${viewport.x} ${viewport.y} ${BOARD.w / viewport.zoom} ${BOARD.h / viewport.zoom}`;
  return { svgRef, viewBox };
}

export function MiniEditor() {
  const { svgRef, viewBox } = useWheelZoom();
  return (
    <figure className={s.editor}>
      <div className={s.board}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className={s.svg}
          role="group"
          aria-label="도형 편집 캔버스. 도형을 드래그하거나 선택 후 방향키로 이동, R로 회전"
          onPointerDown={(ev) => ev.target === ev.currentTarget && editor.select(null)}
        >
          <defs>
            <pattern id="grid-dot" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={1} className={s.dot} />
            </pattern>
          </defs>
          {/* 축소하면 보드 바깥도 보이므로 격자는 넓게, 보드 경계는 옅은 선으로 */}
          <rect x={-BOARD.w} y={-BOARD.h} width={BOARD.w * 3} height={BOARD.h * 3} fill="url(#grid-dot)" pointerEvents="none" />
          <rect width={BOARD.w} height={BOARD.h} className={s.boardEdge} pointerEvents="none" />
          {ids.map((id) => (
            <Item key={id} id={id} />
          ))}
        </svg>
        <ResetButton />
        <StatusBar />
        <HistoryControls />
      </div>
      <Timeline />
    </figure>
  );
}
