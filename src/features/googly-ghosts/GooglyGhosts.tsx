"use client";

import { useEffect, useRef } from "react";
import s from "./googly-ghosts.module.css";

/**
 * 커서를 쳐다보는 유령 무리. three.js 없이 SVG transform만 매 프레임 바꾼다.
 * 눈만 굴리지 않고 얼굴(눈, 볼, 입) 전체를 커서 쪽으로 밀고 가로로 살짝 눌러
 * 고개를 돌리는 것처럼 보이게 한다. 그림은 단색 면 두 장(밝은 면, 그늘 면)의 2D.
 * 몸 틀은 하나지만 마리마다 늘이거나 뒤집고 눈, 입, 소품을 달리해 같은 모양으로 보이지 않게 한다.
 */

const VIEW_W = 720;
/** 맨 뒤 유령이 깡총 뛰어도 머리가 잘리지 않는 만큼만 위를 남김 */
const VIEW_Y = 50;
const VIEW_H = 293;
/** 유령 한 마리의 로컬 좌표: 폭 100, 머리 꼭대기 y=0, 오른쪽으로 휘는 짧은 꼬리 끝 y=124 */
const BODY = "M50 0C80 0 98 24 98 56C98 82 92 99 80 110C76 114 74 118 74 124C64 120 54 116 42 115C18 112 2 92 2 60C2 24 20 0 50 0Z";
const FOOT_Y = 118;
/** 늘이기 전 얼굴 가운데와 어깨 높이 */
const FACE_Y = 60;
const SHOULDER_Y = 72;
const FACE_SCALE = 1.15;
/** 고개를 끝까지 돌렸을 때 얼굴이 밀리는 거리 */
const TURN_X = 13;
const TURN_Y = 8;
/** 눈이 끝까지 돌아가는 커서 거리(px) */
const REACH = 260;

type Tint = "plain" | "mint" | "yellow" | "coral" | "accent";
type EyeKind = "round" | "big" | "bead" | "oval";
type Mouth = "open" | "smile" | "cat" | "tongue";
type Prop = "none" | "curl" | "bow";
type Ghost = {
  x: number;
  base: number;
  scale: number;
  tint: Tint;
  /** 스프링 탄성. 마리마다 달라서 따라오는 속도가 조금씩 어긋남 */
  k: number;
  /** 몸을 가로세로로 늘인 비율. 얼굴은 늘이지 않음 */
  sx: number;
  sy: number;
  /** 꼬리를 왼쪽으로 */
  flip: boolean;
  eyes: EyeKind;
  mouth: Mouth;
  prop: Prop;
  /** 평소 팔 높이(도) */
  arms: number;
};

// 뒤쪽(작고 위)부터 그려야 앞줄이 겹쳐 보임
const GHOSTS: Ghost[] = [
  { x: 212, base: 196, scale: 0.78, tint: "mint", k: 70, sx: 0.9, sy: 1.1, flip: false, eyes: "bead", mouth: "smile", prop: "none", arms: 34 },
  { x: 365, base: 188, scale: 0.84, tint: "plain", k: 140, sx: 1.12, sy: 0.9, flip: true, eyes: "big", mouth: "open", prop: "curl", arms: 12 },
  { x: 518, base: 200, scale: 0.76, tint: "yellow", k: 95, sx: 1, sy: 1, flip: false, eyes: "oval", mouth: "cat", prop: "bow", arms: 48 },
  { x: 118, base: 302, scale: 0.98, tint: "plain", k: 110, sx: 1.04, sy: 0.96, flip: true, eyes: "round", mouth: "tongue", prop: "none", arms: 6 },
  { x: 290, base: 316, scale: 1.16, tint: "coral", k: 160, sx: 0.96, sy: 1.04, flip: false, eyes: "big", mouth: "open", prop: "bow", arms: 22 },
  { x: 462, base: 308, scale: 0.98, tint: "accent", k: 80, sx: 1.16, sy: 0.88, flip: true, eyes: "bead", mouth: "cat", prop: "curl", arms: 0 },
  { x: 615, base: 298, scale: 0.9, tint: "plain", k: 125, sx: 0.88, sy: 1.12, flip: false, eyes: "oval", mouth: "smile", prop: "none", arms: 40 },
];

/** 흰자(rx, ry)와 그 안에서 굴러다니는 눈동자(px, py) 크기 */
const EYE_SHAPES: Record<EyeKind, { rx: number; ry: number; px: number; py: number; gap: number; shine: number; dot: boolean }> = {
  round: { rx: 10, ry: 11.5, px: 6.5, py: 7.5, gap: 17, shine: 2.4, dot: true },
  big: { rx: 11.5, ry: 13, px: 7.6, py: 8.6, gap: 18.5, shine: 2.8, dot: true },
  bead: { rx: 8.5, ry: 9.5, px: 4.3, py: 4.9, gap: 15.5, shine: 1.7, dot: false },
  oval: { rx: 8.5, ry: 12.5, px: 5.6, py: 7.8, gap: 16, shine: 2.1, dot: true },
};

type Look = { x: number; y: number; vx: number; vy: number };

function ghostTransform(g: Ghost, dy: number, lean: number) {
  return `translate(${g.x} ${(g.base + dy).toFixed(2)}) rotate(${lean.toFixed(2)}) scale(${g.scale}) translate(-50 ${-FOOT_Y})`;
}

/** 발끝을 기준으로 몸을 늘이고 뒤집음 */
function bodyTransform(g: Ghost) {
  return `translate(50 ${FOOT_Y}) scale(${g.flip ? -g.sx : g.sx} ${g.sy}) translate(-50 ${-FOOT_Y})`;
}

/** 늘인 몸에서 높이 y인 지점이 옮겨 가는 높이 */
const stretchY = (g: Ghost, y: number) => FOOT_Y - (FOOT_Y - y) * g.sy;

/** 돌아본 쪽으로 얼굴을 밀고, 옆을 볼수록 가로로 좁혀 원근처럼 */
function faceTransform(g: Ghost, l: Look) {
  const squeeze = 1 - Math.abs(l.x) * 0.14;
  return `translate(${(50 + l.x * TURN_X * g.sx).toFixed(2)} ${(stretchY(g, FACE_Y) + l.y * TURN_Y).toFixed(2)}) scale(${(FACE_SCALE * squeeze).toFixed(3)} ${FACE_SCALE})`;
}

/** 눈은 얼굴보다 조금 더 감 */
function eyeTransform(g: Ghost, side: -1 | 1, l: Look, blink: number) {
  const gap = EYE_SHAPES[g.eyes].gap;
  return `translate(${(side * gap + l.x * 1.5).toFixed(2)} ${(-4 + l.y).toFixed(2)}) scale(1 ${blink.toFixed(3)})`;
}

/** 눈동자는 흰자 테두리에 닿을 때까지 커서 쪽으로 */
function pupilTransform(g: Ghost, l: Look) {
  const e = EYE_SHAPES[g.eyes];
  return `translate(${(l.x * (e.rx - e.px - 1)).toFixed(2)} ${(l.y * (e.ry - e.py - 1)).toFixed(2)})`;
}

/** 어깨를 축으로 팔을 듦. 양쪽이 같은 각도면 왼팔은 시계 방향, 오른팔은 반대로 */
function armTransform(g: Ghost, side: -1 | 1, lift: number) {
  return `translate(${50 + side * 40 * g.sx} ${stretchY(g, SHOULDER_Y)}) rotate(${(-side * lift).toFixed(2)})`;
}

/** 커서 방향으로 길이 0–0.85인 목표점. 가까울수록 덜 돌아감 */
function aim(dx: number, dy: number) {
  const d = Math.hypot(dx, dy) || 1;
  const m = Math.min(d / REACH, 1) * 0.85;
  return [(dx / d) * m, (dy / d) * m] as const;
}

/** 목표로 끌려가는 감쇠 스프링. 단위 원을 넘으면 테두리에서 튕김 */
function step(l: Look, tx: number, ty: number, k: number, damping: number, dt: number) {
  const c = 2 * Math.sqrt(k) * damping;
  l.vx += ((tx - l.x) * k - l.vx * c) * dt;
  l.vy += ((ty - l.y) * k - l.vy * c) * dt;
  l.x += l.vx * dt;
  l.y += l.vy * dt;
  const r = Math.hypot(l.x, l.y);
  if (r > 1) {
    const nx = l.x / r;
    const ny = l.y / r;
    l.x = nx;
    l.y = ny;
    const vn = l.vx * nx + l.vy * ny;
    if (vn > 0) {
      l.vx -= 1.6 * vn * nx;
      l.vy -= 1.6 * vn * ny;
    }
  }
}

function MouthShape({ kind }: { kind: Mouth }) {
  if (kind === "open") {
    return (
      <>
        <path d="M-6 4Q0 14 6 4Z" className={s.mouth} />
        <ellipse cy="9" rx="3" ry="1.8" className={s.tongue} />
      </>
    );
  }
  if (kind === "tongue") {
    return (
      <>
        <ellipse cx="2" cy="8.5" rx="2.6" ry="3.2" className={s.tongue} />
        <path d="M-6 4Q0 9 6 4" className={s.stroke} />
      </>
    );
  }
  return <path d={kind === "cat" ? "M-6 4Q-3 8 0 4Q3 8 6 4" : "M-5 4Q0 9 5 4"} className={s.stroke} />;
}

/** 소품은 몸과 함께 늘어나고 뒤집힘 */
function PropShape({ kind }: { kind: Prop }) {
  if (kind === "curl") {
    return <path d="M46 4C42 -6 50 -14 59 -11C53 -9 52 -3 56 4Z" className={s.light} />;
  }
  if (kind === "bow") {
    return (
      <g transform="translate(76 15) rotate(28)" className={s.bow}>
        <path d="M0 0L-10 -7V7Z" />
        <path d="M0 0L10 -7V7Z" />
        <circle r="3.2" />
      </g>
    );
  }
  return null;
}

export function GooglyGhosts() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const damping = reduced ? 1 : 0.3;

    const parts = [...svg.querySelectorAll<SVGGElement>("[data-ghost]")].map((g) => ({
      g,
      face: g.querySelector<SVGGElement>("[data-face]")!,
      eyes: [...g.querySelectorAll<SVGGElement>("[data-eye]")],
      pupils: [...g.querySelectorAll<SVGGElement>("[data-pupil]")],
      arms: [...g.querySelectorAll<SVGGElement>("[data-arm]")],
      mouth: g.querySelector<SVGElement>("[data-mouth]")!,
      oh: g.querySelector<SVGElement>("[data-oh]")!,
    }));
    const shadows = [...svg.querySelectorAll<SVGEllipseElement>("[data-shadow]")];

    const now0 = performance.now();
    const state = GHOSTS.map((g) => ({
      look: { x: 0, y: 0, vx: 0, vy: 0 } as Look,
      hopY: 0,
      hopV: 0,
      lift: g.arms,
      blinkAt: now0 + 1500 + Math.random() * 4000,
      blinkStart: -1,
      surprisedUntil: 0,
      surprised: false,
    }));

    // 마우스는 화면 어디서든 따라감. 터치는 누른 자리를 잠깐 보다가 다시 두리번거림
    const pointer = { x: 0, y: 0, at: -Infinity, touch: false };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = performance.now();
      pointer.touch = e.pointerType !== "mouse";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });

    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element).closest<SVGGElement>("[data-ghost]");
      if (!el) return;
      const st = state[Number(el.dataset.ghost)];
      if (!reduced && st.hopY === 0) st.hopV = -240;
      st.surprisedUntil = performance.now() + 700;
      st.look.vx += (Math.random() - 0.5) * 12;
      st.look.vy += (Math.random() - 0.5) * 12;
    };
    svg.addEventListener("pointerdown", onDown);

    let raf = 0;
    let prev = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;
      const rect = svg.getBoundingClientRect();
      const k = rect.width / VIEW_W;
      const t = now / 1000;

      let tx: number;
      let ty: number;
      if (now - pointer.at < (pointer.touch ? 2500 : Infinity)) {
        tx = pointer.x;
        ty = pointer.y;
      } else {
        tx = rect.left + rect.width / 2 + Math.sin(t * 0.7) * rect.width * 0.45;
        ty = rect.top + rect.height / 2 + Math.sin(t * 1.1 + 1) * rect.height * 0.6;
      }

      GHOSTS.forEach((g, i) => {
        const st = state[i];
        const p = parts[i];

        const [ax, ay] = aim(
          tx - (rect.left + g.x * k),
          ty - (rect.top + (g.base + (stretchY(g, FACE_Y) - FOOT_Y) * g.scale - VIEW_Y) * k),
        );
        step(st.look, ax, ay, g.k, damping, dt);

        if (st.hopV !== 0 || st.hopY < 0) {
          st.hopV += 1500 * dt;
          st.hopY += st.hopV * dt;
          if (st.hopY >= 0) st.hopY = st.hopV = 0;
        }
        const bob = reduced ? 0 : Math.sin(t * 1.8 + i * 1.3) * 3.5;
        p.g.setAttribute("transform", ghostTransform(g, bob + st.hopY, st.look.x * 5));
        p.face.setAttribute("transform", faceTransform(g, st.look));

        if (now > st.blinkAt) {
          st.blinkStart = now;
          st.blinkAt = now + 2500 + Math.random() * 4000;
        }
        const bp = (now - st.blinkStart) / 160;
        const blink = bp >= 0 && bp < 1 ? 1 - Math.sin(bp * Math.PI) * 0.9 : 1;
        p.eyes.forEach((eye, j) => eye.setAttribute("transform", eyeTransform(g, j === 0 ? -1 : 1, st.look, blink)));
        const pupil = pupilTransform(g, st.look);
        p.pupils.forEach((el) => el.setAttribute("transform", pupil));

        const surprised = now < st.surprisedUntil;
        if (surprised !== st.surprised) {
          st.surprised = surprised;
          p.mouth.setAttribute("visibility", surprised ? "hidden" : "visible");
          p.oh.setAttribute("visibility", surprised ? "visible" : "hidden");
        }
        // 놀라면 팔을 번쩍. 평소엔 둥실거리며 조금씩 흔듦
        const wave = reduced ? 0 : Math.sin(t * 2.2 + i * 0.9) * 7;
        st.lift += ((surprised ? 60 : g.arms) - st.lift) * Math.min(1, dt * 14);
        p.arms.forEach((arm, j) => arm.setAttribute("transform", armTransform(g, j === 0 ? -1 : 1, st.lift + (j === 0 ? wave : -wave))));

        // 떠오를수록 그림자가 작고 옅어짐
        const lift = Math.min(1, -(bob + st.hopY - 3.5) / 60);
        shadows[i].setAttribute("transform", `translate(${g.x} ${g.base + 6}) scale(${(g.scale * g.sx * (1 - lift * 0.35)).toFixed(3)} ${g.scale})`);
        shadows[i].style.opacity = String(1 - lift * 0.5);
      });

      raf = requestAnimationFrame(frame);
    };

    // 화면 밖에서는 멈춤
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(svg);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      svg.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const rest: Look = { x: 0, y: 0, vx: 0, vy: 0 };

  return (
    <figure className={s.demo}>
      <div className={s.stage}>
        <svg
          ref={svgRef}
          className={s.svg}
          viewBox={`0 ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="커서 쪽으로 고개를 돌리는 유령 일곱 마리"
        >
          <defs>
            <clipPath id="gg-body">
              <path d={BODY} />
            </clipPath>
            {/* 얼굴은 늘이지 않으므로, 얼굴을 몸 모양으로 자르는 틀은 마리마다 늘인 몸으로 */}
            {GHOSTS.map((g, i) => (
              <clipPath key={i} id={`gg-body-${i}`}>
                <path d={BODY} transform={bodyTransform(g)} />
              </clipPath>
            ))}
          </defs>

          {GHOSTS.map((g, i) => (
            <ellipse
              key={`shadow-${i}`}
              data-shadow
              className={s.shadow}
              rx="34"
              ry="5"
              transform={`translate(${g.x} ${g.base + 6}) scale(${g.scale * g.sx} ${g.scale})`}
            />
          ))}

          {GHOSTS.map((g, i) => {
            const eye = EYE_SHAPES[g.eyes];
            return (
              <g key={i} data-ghost={i} className={s.ghost} data-tint={g.tint} transform={ghostTransform(g, 0, 0)}>
                {/* 팔은 몸 뒤에 그려 어깨가 가려지게. 끝에 엄지처럼 작은 혹 */}
                {([-1, 1] as const).map((side) => (
                  <g key={side} data-arm transform={armTransform(g, side, g.arms)}>
                    <ellipse cx={side * 15} rx="16" ry="6.5" className={s.light} />
                    <ellipse cx={side * 26} cy="-5" rx="3.6" ry="5" className={s.light} />
                  </g>
                ))}
                {/* 그늘 면 위에 밝은 면을 왼쪽 위로 비켜 얹어 반대쪽 아래만 그늘이 남게 */}
                <g transform={bodyTransform(g)}>
                  <path d={BODY} className={s.shade} />
                  {/* 뒤집힌 몸에서도 빛은 늘 왼쪽 위에서 */}
                  <ellipse cx={g.flip ? 60 : 40} cy="54" rx="50" ry="76" className={s.light} clipPath="url(#gg-body)" />
                  <PropShape kind={g.prop} />
                </g>
                <g clipPath={`url(#gg-body-${i})`}>
                  <g data-face transform={faceTransform(g, rest)}>
                    <ellipse cx="-29" cy="11" rx="7.5" ry="4.5" className={s.blush} />
                    <ellipse cx="29" cy="11" rx="7.5" ry="4.5" className={s.blush} />
                    {([-1, 1] as const).map((side) => (
                      <g key={side} data-eye transform={eyeTransform(g, side, rest, 1)}>
                        <ellipse rx={eye.rx} ry={eye.ry} className={s.sclera} />
                        <g data-pupil transform={pupilTransform(g, rest)}>
                          <ellipse rx={eye.px} ry={eye.py} className={s.ink} />
                          <circle cx={eye.px * 0.32} cy={-eye.py * 0.38} r={eye.shine} className={s.shine} />
                          {eye.dot && <circle cx={-eye.px * 0.36} cy={eye.py * 0.4} r="1" className={s.shine} />}
                        </g>
                      </g>
                    ))}
                    <g data-mouth transform="translate(0 9)">
                      <MouthShape kind={g.mouth} />
                    </g>
                    <ellipse data-oh cy="16" rx="3.4" ry="4.4" className={s.mouth} visibility="hidden" />
                  </g>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
