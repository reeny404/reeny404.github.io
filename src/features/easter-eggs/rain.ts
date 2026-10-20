import { runSim, type Sim } from "@/features/physics/runner";
import { createWorld, type World } from "@/features/physics/world";

/**
 * 콘솔 명령 rain(). 화면 전체 위로 공을 쏟아 화면 아래에 쌓음.
 * 캔버스는 클릭을 통과시켜 사이트는 그대로 쓸 수 있고, 페이지를 옮겨도 남아 있음. stop()이나 새로고침으로 치움.
 */

const COLORS = ["--color-accent", "--color-decorative-coral", "--color-decorative-yellow", "--color-decorative-mint", "--color-text"];
const SIZES = [8, 11, 14, 18];
const PER_CALL = 90;
const MAX_BALLS = 450;
const POUR = 1.8;

let state: { canvas: HTMLCanvasElement; world: World; sim: Sim; queue: number; timer: number } | null = null;

function start() {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:var(--layer-floating)";
  document.body.append(canvas);
  const world = createWorld({ openTop: true });
  const s = { canvas, world, queue: 0, timer: 0, sim: null as unknown as Sim };
  s.sim = runSim({
    stage: canvas,
    canvas,
    world,
    colorVars: COLORS,
    interactive: false,
    beforeStep(dt) {
      if (s.queue <= 0) return false;
      s.timer += dt;
      const rate = PER_CALL / POUR;
      while (s.timer >= 1 / rate && s.queue > 0) {
        s.timer -= 1 / rate;
        s.queue--;
        const r = SIZES[Math.floor(Math.random() * SIZES.length)];
        const b = world.add(r + Math.random() * (world.w - r * 2), -r - Math.random() * 40, r, world.bodies.length % COLORS.length);
        b.vy = 300 + Math.random() * 300;
        b.vx = (Math.random() - 0.5) * 120;
      }
      return true;
    },
  });
  state = s;
  return s;
}

/** 공을 더 쏟음. 화면에 너무 많아지지 않도록 상한 */
export function rain() {
  const s = state ?? start();
  const room = MAX_BALLS - s.world.bodies.length - s.queue;
  s.queue += Math.max(0, Math.min(PER_CALL, room));
  s.sim.wake();
  return room > 0;
}

export function stopRain() {
  if (!state) return false;
  state.sim.destroy();
  state.canvas.remove();
  state = null;
  return true;
}
