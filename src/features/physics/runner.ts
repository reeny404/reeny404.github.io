import { drawBalls } from "./render";
import type { Body, World } from "./world";

/**
 * 캔버스 하나에 world를 돌리는 공통 루프.
 * 크기와 화면 배율, 테마 색, 잡아 던지기, 화면 밖이나 모두 멈췄을 때 쉬기를 맡는다.
 */

/**
 * 쌓인 공은 중력과 밀어내기가 맞서 속도가 0이 되지 않으므로(초당 수십 px),
 * 속도 대신 한 프레임 동안 실제로 움직인 거리로 멈춤을 판단
 */
const REST_MOVE = 0.5;
const REST_FRAMES = 30;
const MAX_THROW = 2400;

export type SimOptions = {
  /** 크기를 따라가는 요소. 캔버스는 이 요소를 가득 채운다고 가정 */
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  world: World;
  /** 공 색으로 쓸 CSS 변수. body.color가 이 순서 */
  colorVars: readonly string[];
  /** 잡아 던지기와 빈 곳 누르기. 기본 true */
  interactive?: boolean;
  /** 크기가 정해지거나 바뀐 뒤. first는 처음 한 번 */
  onResize?: (w: number, h: number, first: boolean) => void;
  /** 물리 전에 매 프레임. true를 돌려주면 아직 할 일(공 쏟기 등)이 남아 쉬지 않음 */
  beforeStep?: (dt: number) => boolean | void;
  /** 기본은 입체 공만 그림 */
  draw?: (ctx: CanvasRenderingContext2D, dpr: number, colors: readonly string[]) => void;
  afterFrame?: () => void;
  /** 처음 화면에 보일 때 한 번 */
  onFirstVisible?: () => void;
};

export type Sim = {
  wake(): void;
  draw(): void;
  readonly colors: readonly string[];
  destroy(): void;
};

export function runSim(o: SimOptions): Sim {
  const { stage, canvas, world } = o;
  const ctx = canvas.getContext("2d")!;
  let dpr = 1;
  let colors: string[] = [];
  let raf = 0;
  let last = 0;
  let visible = false;
  let seen = false;
  let restFrames = 0;
  let prev = new Float64Array(0);
  const pointer = { x: 0, y: 0, samples: [] as { x: number; y: number; t: number }[] };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, world.w, world.h);
    if (o.draw) o.draw(ctx, dpr, colors);
    else drawBalls(ctx, world.bodies, colors, dpr, { held: world.held });
  };

  const frame = (now: number) => {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    const busy = o.beforeStep?.(dt) === true;
    const { held } = world;
    if (held && dt > 0) {
      held.vx = (pointer.x - held.x) / dt;
      held.vy = (pointer.y - held.y) / dt;
    }
    const { bodies } = world;
    if (prev.length < bodies.length * 2) prev = new Float64Array(bodies.length * 4);
    for (let i = 0; i < bodies.length; i++) {
      prev[i * 2] = bodies[i].x;
      prev[i * 2 + 1] = bodies[i].y;
    }
    if (dt > 0) world.step(dt);
    let moved = 0;
    for (let i = 0; i < bodies.length; i++) {
      moved = Math.max(moved, Math.abs(bodies[i].x - prev[i * 2]), Math.abs(bodies[i].y - prev[i * 2 + 1]));
    }
    draw();
    o.afterFrame?.();

    restFrames = busy || held || moved > REST_MOVE ? 0 : restFrames + 1;
    if (restFrames < REST_FRAMES && visible) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      if (restFrames >= REST_FRAMES) for (const b of world.bodies) b.vx = b.vy = 0;
    }
  };

  const wake = () => {
    restFrames = 0;
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const readColors = () => {
    const cs = getComputedStyle(stage);
    colors = o.colorVars.map((v) => cs.getPropertyValue(v).trim() || "#888888");
    draw();
  };

  // ---------- 잡아 던지기 ----------
  const at = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.samples.push({ x: pointer.x, y: pointer.y, t: e.timeStamp });
    while (pointer.samples.length > 2 && e.timeStamp - pointer.samples[0].t > 80) pointer.samples.shift();
  };
  // 손가락으로도 잡기 쉽게 반지름보다 조금 넓게. 위에 그려진(나중) 공부터
  const ballAt = (x: number, y: number): Body | null => {
    for (let i = world.bodies.length - 1; i >= 0; i--) {
      const b = world.bodies[i];
      if (!b.pinned && (b.x - x) ** 2 + (b.y - y) ** 2 < (b.r + 6) ** 2) return b;
    }
    return null;
  };
  const onDown = (e: PointerEvent) => {
    pointer.samples.length = 0;
    at(e);
    // 공을 빼내면 위에 잠들어 있던 공이 떠 있지 않게
    world.wakeAll();
    world.held = ballAt(pointer.x, pointer.y);
    if (world.held) {
      canvas.setPointerCapture(e.pointerId);
      canvas.dataset.grabbing = "";
    } else {
      world.burst(pointer.x, pointer.y, 140, 900);
    }
    wake();
  };
  const onMove = (e: PointerEvent) => {
    at(e);
    if (world.held) return;
    if (ballAt(pointer.x, pointer.y)) canvas.dataset.over = "";
    else delete canvas.dataset.over;
  };
  const onUp = (e: PointerEvent) => {
    const held = world.held;
    if (!held) return;
    at(e);
    const a = pointer.samples[0];
    const b = pointer.samples[pointer.samples.length - 1];
    const dt = (b.t - a.t) / 1000;
    // 멈췄다 놓으면(마지막 움직임이 60ms보다 오래) 그 자리에 떨어뜨림
    const still = e.timeStamp - b.t > 60;
    let vx = dt > 0.008 && !still ? (b.x - a.x) / dt : 0;
    let vy = dt > 0.008 && !still ? (b.y - a.y) / dt : 0;
    const speed = Math.hypot(vx, vy);
    if (speed > MAX_THROW) {
      vx *= MAX_THROW / speed;
      vy *= MAX_THROW / speed;
    }
    held.vx = vx;
    held.vy = vy;
    world.held = null;
    delete canvas.dataset.grabbing;
    wake();
  };
  if (o.interactive !== false) {
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
  }

  // ---------- 크기, 테마, 화면 안팎 ----------
  const resize = () => {
    const first = world.w === 0;
    world.w = stage.clientWidth;
    world.h = stage.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(world.w * dpr);
    canvas.height = Math.round(world.h * dpr);
    o.onResize?.(world.w, world.h, first);
    draw();
    wake();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  const themeObserver = new MutationObserver(readColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", readColors);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) return;
    if (!seen) {
      seen = true;
      o.onFirstVisible?.();
    }
    wake();
  });
  io.observe(stage);

  readColors();

  return {
    wake,
    draw,
    get colors() {
      return colors;
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", readColors);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    },
  };
}
