"use client";

import { useEffect, useRef } from "react";
import { skills } from "@/content/profile";
import { drawBalls } from "@/features/physics/render";
import { runSim } from "@/features/physics/runner";
import { settle } from "@/features/physics/scatter";
import { createWorld, type World } from "@/features/physics/world";
import s from "./skill-balls.module.css";

/**
 * 주요 기술을 이름표 붙은 공으로. 분류마다 색이 다르고, 이름이 들어가는 만큼 크기가 정해진다.
 * 기술 목록(dl)은 그대로 두고 그 아래에서 던져 보는 장난감이라 스크린리더에는 숨김.
 */

const COLORS = ["--color-accent", "--color-decorative-coral", "--color-decorative-yellow", "--color-decorative-mint", "--color-text"];
const FONT_SIZE = 13;

function place(world: World, font: string, above: boolean) {
  world.bodies.length = 0;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const items = skills.flatMap((g, group) => g.items.map((label) => ({ label, group })));
  items.forEach(({ label, group }, i) => {
    const r = Math.max(24, measure.measureText(label).width / 2 + 10);
    const x = r + ((i + 0.5) / items.length) * (world.w - r * 2);
    // 화면에 보일 때 위에서 떨어지도록 판 위쪽 바깥에 줄 세움
    const y = above ? -r - i * 26 : r + Math.random() * (world.h - r * 2);
    world.add(x, y, r, group % COLORS.length, label);
  });
}

export function SkillBalls() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const world = createWorld({ openTop: true, refR: 30 });
    const font = () => `600 ${FONT_SIZE}px ${getComputedStyle(stage).getPropertyValue("--font-sans")}`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sim = runSim({
      stage,
      canvas: canvasRef.current!,
      world,
      colorVars: COLORS,
      onResize(_w, _h, first) {
        if (!first) return;
        place(world, font(), !reduced);
        if (reduced) settle(world);
      },
      draw(ctx, dpr, colors) {
        drawBalls(ctx, world.bodies, colors, dpr, { held: world.held, font: font() });
      },
    });
    return () => sim.destroy();
  }, []);

  return (
    <div className={s.wrap} aria-hidden="true">
      <div ref={stageRef} className={s.stage}>
        <canvas ref={canvasRef} className={s.canvas} />
      </div>
      <ul className={s.legend}>
        {skills.map((g, i) => (
          <li key={g.group} data-color={i % COLORS.length}>
            {g.group}
          </li>
        ))}
      </ul>
      <p className={s.hint}>공을 잡아 던져 보세요.</p>
    </div>
  );
}
