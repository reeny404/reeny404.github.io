"use client";

import { animate, createScope, eases, spring, stagger, type EasingFunction, type EasingParam, type Scope } from "animejs";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import s from "./stagger-grid.module.css";

/**
 * 누른 점에서 거리 순으로 늦게 움직이는 격자.
 * 점마다의 지연은 anime.js stagger({ grid, from })가 계산하고, 색은 CSS 변수 --flash(0–1)를 움직여
 * accent와 섞으므로 테마를 바꿔도 남는 inline 색이 없다.
 */

// 열 수는 데모 폭에 따라 CSS에서 24 또는 12. 둘 다 나누어떨어지는 수라 점 개수는 그대로
const COUNT = 144;
const DOTS = Array.from({ length: COUNT }, (_, i) => i);
type Dims = [cols: number, rows: number];
const centerOf = ([cols, rows]: Dims) => Math.floor(rows / 2) * cols + Math.floor(cols / 2);
// CSS Modules가 클래스 이름을 바꾸므로 코드 예시의 '.dot' 대신 실제 이름으로 선택
const DOT = `.${s.dot}`;

type Pattern = "ripple" | "push" | "shuffle";
type Ease = "spring" | "elastic" | "smooth";

const PATTERNS: [Pattern, string][] = [
  ["ripple", "파도"],
  ["push", "밀어내기"],
  ["shuffle", "무작위"],
];

// 라벨은 이징 이름 대신 눈에 보이는 결과로. 실제 이름은 코드와 비교 줄에 표시
// 차이가 분명하도록 스프링은 한 번만 살짝 넘치고, 탄성은 짧은 주기로 여러 번 출렁이게
const EASES: Record<Ease, { label: string; name: string; code: string; value: () => EasingParam; fn: EasingFunction }> = {
  spring: {
    label: "한 번 튕김",
    name: "spring",
    code: "spring({ bounce: 0.35, duration: 600 })",
    value: () => spring({ bounce: 0.35, duration: 600 }),
    fn: spring({ bounce: 0.35, duration: 600 }).ease,
  },
  elastic: { label: "여러 번 출렁임", name: "outElastic", code: "'outElastic(1, .3)'", value: () => "outElastic(1, .3)", fn: eases.outElastic(1, 0.3) },
  smooth: { label: "튕김 없음", name: "inOutQuad", code: "'inOutQuad'", value: () => "inOutQuad", fn: eases.inOutQuad },
};
const EASE_ORDER = Object.keys(EASES) as Ease[];

/** 0–1 시간에 따른 값. 목표(1)를 넘는 부분이 보이도록 위아래 여백 */
function curvePath(fn: EasingFunction) {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const y = 50 - fn(t) * 34;
    pts.push(`${i === 0 ? "M" : "L"}${(t * 100).toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function Compare({ selected }: { selected: Ease }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  const run = () => {
    const root = ref.current;
    if (!root) return;
    const next = !atEnd;
    setAtEnd(next);
    for (const key of EASE_ORDER) {
      const ball = root.querySelector<HTMLElement>(`[data-ball="${key}"]`)!;
      const track = ball.parentElement!;
      const end = track.clientWidth - ball.offsetWidth;
      animate(ball, { x: next ? end : 0, duration: 1000, ease: EASES[key].value() });
    }
  };

  return (
    <div className={s.compare} ref={ref}>
      <div className={s.compareHead}>
        <p>같은 1초 동안 나란히. 점선을 넘은 만큼 지나쳤다 돌아옴.</p>
        <Button size="sm" onClick={run}>
          {atEnd ? "되돌리기" : "나란히 재생"}
        </Button>
      </div>
      {EASE_ORDER.map((key) => (
        <div key={key} className={s.lane} data-selected={key === selected || undefined}>
          <span className={s.laneLabel}>
            {EASES[key].label}
            <code>{EASES[key].name}</code>
          </span>
          <svg className={s.curve} viewBox="0 0 100 60" aria-hidden="true">
            <line x1="0" y1="16" x2="100" y2="16" />
            <path d={curvePath(EASES[key].fn)} />
          </svg>
          <div className={s.track}>
            <span className={s.ball} data-ball={key} />
            <span className={s.goal} aria-hidden="true" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 긴 이징 식이 줄을 넘지 않도록 맨 위에서 변수로 빼고 아래에서는 이름만 씀
function codeFor(pattern: Pattern, ease: Ease, [cols, rows]: Dims, origin: number) {
  return `const ease = ${EASES[ease].code};\n\n${body(pattern, `{ grid: [${cols}, ${rows}], from: ${origin} }`)}`;
}

function body(pattern: Pattern, grid: string) {
  if (pattern === "ripple") {
    return `animate('.dot', {
  scale: [
    { to: 2.2, duration: 200, ease: 'outQuad' },
    { to: 1, duration: 900, ease },
  ],
  '--flash': [1, 0],
  delay: stagger(40, ${grid}),
});`;
  }
  if (pattern === "push") {
    return `animate('.dot', {
  translateX: [
    { to: stagger(8, { ...grid, axis: 'x' }), duration: 240, ease: 'outQuad' },
    { to: 0, duration: 1000, ease },
  ],
  translateY: /* axis: 'y'로 같은 방식 */,
  '--flash': [1, 0],
  delay: stagger(30, ${grid}),
});`;
  }
  return `animate('.dot', {
  scale: [
    { to: 0, duration: 250, ease: 'inQuad' },
    { to: 1, duration: 800, ease },
  ],
  rotate: [0, 180],
  '--flash': [1, 0],
  delay: stagger(8, { from: 'random' }),
});`;
}

function Segmented<T extends string>({ label, items, value, onChange }: { label: string; items: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className={s.segmented} role="radiogroup" aria-label={label}>
      {items.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function StaggerGrid() {
  const [pattern, setPattern] = useState<Pattern>("ripple");
  const [ease, setEase] = useState<Ease>("spring");
  const [dims, setDims] = useState<Dims>([24, 6]);
  const [origin, setOrigin] = useState(() => centerOf([24, 6]));
  const dimsRef = useRef(dims);
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<Scope | null>(null);
  const lastHover = useRef(-1);

  useEffect(() => {
    const scope = createScope({ root: rootRef }).add((self) => {
      self!.add("play", (from: number, p: Pattern, e: Ease) => {
        const out = EASES[e].value();
        const grid = { grid: dimsRef.current, from };
        const flash = [
          { to: 1, duration: 120 },
          { to: 0, duration: 900, ease: "outQuad" },
        ];
        if (p === "ripple") {
          animate(DOT, {
            scale: [
              { to: 2.2, duration: 200, ease: "outQuad" },
              { to: 1, duration: 900, ease: out },
            ],
            "--flash": flash,
            delay: stagger(40, grid),
          });
        } else if (p === "push") {
          animate(DOT, {
            translateX: [
              { to: stagger(8, { ...grid, axis: "x" }), duration: 240, ease: "outQuad" },
              { to: 0, duration: 1000, ease: out },
            ],
            translateY: [
              { to: stagger(8, { ...grid, axis: "y" }), duration: 240, ease: "outQuad" },
              { to: 0, duration: 1000, ease: out },
            ],
            "--flash": flash,
            delay: stagger(30, grid),
          });
        } else {
          animate(DOT, {
            scale: [
              { to: 0, duration: 250, ease: "inQuad" },
              { to: 1, duration: 800, ease: out },
            ],
            rotate: [0, 180],
            "--flash": flash,
            delay: stagger(8, { from: "random" }),
          });
        }
      });
      // 지나가는 점만 살짝 반응. 큰 움직임은 누를 때만
      self!.add("hover", (i: number) => {
        animate(`[data-i="${i}"] ${DOT}`, { "--flash": [0.7, 0], duration: 600, ease: "outQuad" });
      });
    });
    scopeRef.current = scope;

    // 실제 열 수는 CSS가 정하므로 그려진 격자에서 읽어 stagger와 코드에 반영
    const ro = new ResizeObserver(() => {
      const el = rootRef.current;
      if (!el) return;
      const cols = getComputedStyle(el).gridTemplateColumns.split(" ").length;
      if (cols === dimsRef.current[0]) return;
      const next: Dims = [cols, COUNT / cols];
      dimsRef.current = next;
      setDims(next);
      setOrigin(centerOf(next));
    });
    if (rootRef.current) ro.observe(rootRef.current);

    // 화면에 처음 들어올 때 가운데서 한 번. 움직임 줄이기 설정이면 생략
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        scope.methods.play(centerOf(dimsRef.current), "ripple", "spring");
      },
      { threshold: 0.6 },
    );
    if (!reduced && rootRef.current) io.observe(rootRef.current);

    return () => {
      ro.disconnect();
      io.disconnect();
      scope.revert();
    };
  }, []);

  const indexOf = (target: EventTarget) => {
    const el = (target as HTMLElement).closest<HTMLElement>("[data-i]");
    return el ? Number(el.dataset.i) : -1;
  };

  const play = (from: number) => {
    setOrigin(from);
    scopeRef.current?.methods.play(from, pattern, ease);
  };

  return (
    <figure className={s.demo}>
      <div className={s.head}>
        <Segmented label="패턴" items={PATTERNS} value={pattern} onChange={setPattern} />
        <Segmented label="이징" items={Object.entries(EASES).map(([k, v]) => [k as Ease, v.label])} value={ease} onChange={setEase} />
        <Button size="sm" onClick={() => play(centerOf(dims))}>
          가운데서 재생
        </Button>
      </div>

      <div
        ref={rootRef}
        className={s.grid}
        aria-hidden="true"
        onPointerDown={(e) => {
          const i = indexOf(e.target);
          if (i >= 0) play(i);
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const i = indexOf(e.target);
          if (i < 0 || i === lastHover.current) return;
          lastHover.current = i;
          scopeRef.current?.methods.hover(i);
        }}
      >
        {DOTS.map((i) => (
          <span key={i} className={s.cell} data-i={i}>
            <span className={s.dot} />
          </span>
        ))}
      </div>

      <div className={s.bottom}>
        <Compare selected={ease} />
        <pre className={s.code} aria-label="지금 설정의 anime.js 코드">
          <code>{codeFor(pattern, ease, dims, origin)}</code>
        </pre>
      </div>
      <figcaption className={s.caption}>설정을 바꾸면 코드도 같이 바뀜.</figcaption>
    </figure>
  );
}
