"use client";

import { useSyncExternalStore } from "react";
import { Glyph } from "./MiniEditor";
import { BOARD, GRID, type Shape } from "./store";
import s from "./editor.module.css";
import b from "./empty-board.module.css";

/**
 * 404 화면의 보드. 첫 화면 에디터와 같은 도형이 가장자리로 밀려나 있고,
 * 가운데 선택 상자만 비어 있음. 상자의 좌표는 요청한 주소에서 계산해 주소마다 다른 자리를 가리킴.
 */

// 왼쪽 아래는 상태 표시(404와 주소) 자리라 비워 둠
const shapes: Shape[] = [
  { id: "rect", kind: "rect", name: "사각형", cx: 86, cy: 74, w: 120, h: 84, rotation: -8 },
  { id: "text", kind: "text", name: "텍스트", cx: 262, cy: 44, w: 150, h: 56, rotation: 3 },
  { id: "ellipse", kind: "ellipse", name: "원", cx: 452, cy: 70, w: 92, h: 92, rotation: 0 },
  { id: "star", kind: "star", name: "별", cx: 336, cy: 280, w: 104, h: 100, rotation: 14 },
  { id: "triangle", kind: "triangle", name: "삼각형", cx: 466, cy: 250, w: 84, h: 72, rotation: -20 },
];

// 비어 있는 자리. 첫 화면 사각형과 같은 크기
const SLOT = { w: 120, h: 84 };

/** 같은 주소는 늘 같은 좌표. 도형과 겹치지 않는 가운데 영역에서 격자에 맞춰 고름 */
function slotFor(path: string) {
  let h = 0;
  for (const ch of path) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  // 200은 왼쪽 위 사각형과 겹쳐서 220부터
  const xs = [220, 240, 260, 280, 300];
  const ys = [160, 180];
  return { cx: xs[h % xs.length], cy: ys[(h >>> 8) % ys.length] };
}

const subscribeNoop = () => () => {};

export function EmptyBoard() {
  // 정적 404.html은 빌드할 때 주소를 모름. hydration이 끝난 뒤 브라우저에서만 읽고, 그 전에는 빈 자리를 숨김
  const path = useSyncExternalStore(subscribeNoop, () => decodeURI(window.location.pathname), () => null);
  const slot = slotFor(path ?? "");
  const left = slot.cx - SLOT.w / 2;
  const top = slot.cy - SLOT.h / 2;

  return (
    <figure className={`${s.editor} ${b.frame}`}>
      <div className={s.board}>
        <svg viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} className={s.svg} aria-hidden="true">
          <defs>
            <pattern id="grid-dot-404" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={1} className={s.dot} />
            </pattern>
          </defs>
          <rect width={BOARD.w} height={BOARD.h} fill="url(#grid-dot-404)" />
          {shapes.map((e) => (
            <g key={e.id} transform={`translate(${e.cx} ${e.cy}) rotate(${e.rotation}) translate(${-e.w / 2} ${-e.h / 2})`}>
              <Glyph e={e} />
            </g>
          ))}
          <g className={b.slot} visibility={path === null ? "hidden" : undefined}>
            <rect x={left} y={top} width={SLOT.w} height={SLOT.h} rx={6} className={b.marquee} />
            {[
              [left, top],
              [left + SLOT.w, top],
              [left, top + SLOT.h],
              [left + SLOT.w, top + SLOT.h],
            ].map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width={8} height={8} rx={2} className={b.corner} />
            ))}
            <text x={slot.cx} y={slot.cy} className={b.coord} textAnchor="middle" dominantBaseline="central">
              ({slot.cx}, {slot.cy})
            </text>
          </g>
        </svg>
        <p className={s.status}>
          <span className={s.badge}>404</span>
          <span className={b.path}>{path ?? ""}</span>
        </p>
      </div>
      <figcaption className="visually-hidden">
        첫 화면 에디터의 도형들이 가장자리에 있고, 가운데 {path ?? "요청한 주소"} 자리의 선택 상자만 비어 있는 보드
      </figcaption>
    </figure>
  );
}
