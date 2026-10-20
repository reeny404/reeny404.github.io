"use client";

import { useEffect, useRef } from "react";
import { runSim } from "@/features/physics/runner";
import { createWorld, type Body, type World } from "@/features/physics/world";
import { BOARD, type Shape } from "@/features/editor/store";
import s from "./slot-balls.module.css";

/**
 * 404 보드의 빈 선택 상자를 공으로 쓴 "404"가 채움.
 * 누르면 무너져 도형에 부딪히며 바닥에 쌓이고, 잠시 뒤 다시 제자리로 날아가 글자가 됨.
 * 글자를 이루는 동안은 공을 고정(pinned)하고 직접 옮기며, 무너진 뒤에만 물리로 움직인다.
 */

// 글자가 읽히도록 한 색. 선택 상자와 같은 accent
const COLORS = ["--color-accent"];
// 3×5 점 글씨
const GLYPHS: Record<string, string[]> = {
  "4": ["101", "101", "111", "001", "001"],
  "0": ["111", "101", "101", "101", "111"],
};
/** 점 사이 간격과 공 반지름(보드 단위). 11칸 × 5줄이 120 × 84 상자 안에 */
const GAP = 10.5;
const RADIUS = 5;
const FORM_MS = 700;
const STAGGER_MS = 22;
const REFORM_AFTER = 3500;

type Target = { x: number; y: number };

function targets(slot: { cx: number; cy: number }): Target[] {
  const text = "404";
  const cols = text.length * 4 - 1;
  const x0 = slot.cx - (cols * GAP) / 2 + GAP / 2;
  const y0 = slot.cy - (5 * GAP) / 2 + GAP / 2;
  const out: Target[] = [];
  [...text].forEach((ch, d) => {
    GLYPHS[ch].forEach((row, r) => {
      [...row].forEach((on, c) => {
        if (on === "1") out.push({ x: x0 + (d * 4 + c) * GAP, y: y0 + r * GAP });
      });
    });
  });
  // 아래 줄부터 쌓이도록
  return out.sort((a, b) => b.y - a.y || a.x - b.x);
}

/** 도형을 회전한 캡슐(굵은 선분)로 근사해 무너진 공이 부딪히게 */
function obstacles(world: World, shapes: readonly Shape[], k: number) {
  world.segments = shapes.map((e) => {
    const long = Math.max(e.w, e.h);
    const short = Math.min(e.w, e.h);
    const a = ((e.rotation + (e.h > e.w ? 90 : 0)) * Math.PI) / 180;
    const half = ((long - short) / 2) * k;
    return {
      ax: e.cx * k - Math.cos(a) * half,
      ay: e.cy * k - Math.sin(a) * half,
      bx: e.cx * k + Math.cos(a) * half,
      by: e.cy * k + Math.sin(a) * half,
      r: (short / 2) * k * 0.9,
    };
  });
}

const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

type Flight = { b: Body; from: Target; to: Target; delay: number };

function setPinned(bodies: Body[], pinned: boolean) {
  for (const b of bodies) {
    b.pinned = pinned;
    b.asleep = false;
    b.vx = b.vy = 0;
  }
}

export function SlotBalls({ slot, shapes }: { slot: { cx: number; cy: number }; shapes: readonly Shape[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const world = createWorld({ openTop: true, restitution: 0.45 });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const goal = targets(slot);
    let k = 1;
    let flights: Flight[] = [];
    let started = 0;
    let reform = 0;

    const toPx = (t: Target) => ({ x: t.x * k, y: t.y * k });

    /** from 위치에서 글자 자리로 날아감. 처음에는 보드 위쪽 바깥에서 떨어짐 */
    const form = (fromAbove: boolean) => {
      setPinned(world.bodies, true);
      flights = world.bodies.map((b, i) => ({
        b,
        from: fromAbove ? { x: toPx(goal[i]).x, y: -20 - (goal.length - i) * 3 } : { x: b.x, y: b.y },
        to: toPx(goal[i]),
        delay: i * STAGGER_MS,
      }));
      started = performance.now();
      if (reduced) finish();
      sim.wake();
    };

    const finish = () => {
      for (const f of flights) {
        f.b.x = f.to.x;
        f.b.y = f.to.y;
      }
      flights = [];
    };

    // 글자인 상태에서 누르면 고정을 풀어 무너뜨리고, runner가 이어서 그 자리를 밀어냄
    const onDown = () => {
      window.clearTimeout(reform);
      if (world.bodies.some((b) => b.pinned)) {
        flights = [];
        setPinned(world.bodies, false);
      }
    };
    const onUp = () => {
      window.clearTimeout(reform);
      reform = window.setTimeout(() => form(false), REFORM_AFTER);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    const sim = runSim({
      stage,
      canvas,
      world,
      colorVars: COLORS,
      onResize(w, _h, first) {
        k = w / BOARD.w;
        obstacles(world, shapes, k);
        if (first) {
          goal.forEach(() => world.add(0, 0, RADIUS * k, 0));
          form(true);
        } else {
          for (const b of world.bodies) b.r = RADIUS * k;
          if (world.bodies.every((b) => b.pinned)) {
            flights = [];
            world.bodies.forEach((b, i) => Object.assign(b, toPx(goal[i])));
          }
        }
      },
      beforeStep() {
        if (!flights.length) return false;
        const now = performance.now() - started;
        let done = true;
        for (const f of flights) {
          const t = Math.min(1, Math.max(0, (now - f.delay) / FORM_MS));
          if (t < 1) done = false;
          const e = easeOutBack(t);
          f.b.x = f.from.x + (f.to.x - f.from.x) * e;
          f.b.y = f.from.y + (f.to.y - f.from.y) * e;
        }
        if (done) flights = [];
        return true;
      },
    });

    return () => {
      window.clearTimeout(reform);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      sim.destroy();
    };
  }, [slot, shapes]);

  return (
    <div ref={stageRef} className={s.stage}>
      <canvas ref={canvasRef} className={s.canvas} />
    </div>
  );
}
