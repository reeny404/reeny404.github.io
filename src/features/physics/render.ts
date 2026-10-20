import type { Body } from "./world";

/**
 * 왼쪽 위에서 빛을 받는 입체 공.
 * 반지름 1인 원 기준의 그라디언트를 캔버스마다 한 번 만들고, 공마다 transform으로 크기와 위치만 바꿔 다시 씀
 */

type Gradients = { shading: CanvasGradient; shadow: CanvasGradient };
const cache = new WeakMap<CanvasRenderingContext2D, Gradients>();

function gradients(ctx: CanvasRenderingContext2D) {
  let g = cache.get(ctx);
  if (!g) {
    const shading = ctx.createRadialGradient(-0.38, -0.42, 0.04, -0.1, -0.12, 1.08);
    shading.addColorStop(0, "rgb(255 255 255 / 0.7)");
    shading.addColorStop(0.18, "rgb(255 255 255 / 0.22)");
    shading.addColorStop(0.55, "rgb(255 255 255 / 0)");
    shading.addColorStop(0.82, "rgb(0 0 0 / 0.1)");
    shading.addColorStop(1, "rgb(0 0 0 / 0.32)");
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    shadow.addColorStop(0, "rgb(0 0 0 / 0.24)");
    shadow.addColorStop(1, "rgb(0 0 0 / 0)");
    g = { shading, shadow };
    cache.set(ctx, g);
  }
  return g;
}

/** 원점이 공 중심이고 단위가 반지름인 좌표계로 바꿔 단위 원을 채움 */
function fillUnit(ctx: CanvasRenderingContext2D, dpr: number, style: CanvasGradient, x: number, y: number, sx: number, sy: number) {
  ctx.setTransform(dpr * sx, 0, 0, dpr * sy, dpr * x, dpr * y);
  ctx.fillStyle = style;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
}

/** #RRGGBB의 밝기로 위에 올릴 글자를 검정과 흰색 중에서 고름 */
export function isLight(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export type DrawOptions = {
  held?: Body | null;
  /** 그림자. 아주 작은 공이 많으면 꺼서 가볍게 */
  shadow?: boolean;
  /** 이름표 글꼴. 있으면 body.label을 공 가운데에 씀 */
  font?: string;
};

export function drawBalls(ctx: CanvasRenderingContext2D, bodies: readonly Body[], colors: readonly string[], dpr: number, options: DrawOptions = {}) {
  const { shading, shadow } = gradients(ctx);
  if (options.shadow !== false) {
    for (const b of bodies) fillUnit(ctx, dpr, shadow, b.x + b.r * 0.22, b.y + b.r * 0.42, b.r * 1.1, b.r * 0.9);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let c = 0; c < colors.length; c++) {
    ctx.fillStyle = colors[c];
    ctx.beginPath();
    for (const b of bodies) {
      if (b.color !== c) continue;
      ctx.moveTo(b.x + b.r, b.y);
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  for (const b of bodies) if (b.r >= 4) fillUnit(ctx, dpr, shading, b.x, b.y, b.r, b.r);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (options.font) {
    ctx.font = options.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const b of bodies) {
      if (!b.label) continue;
      ctx.fillStyle = isLight(colors[b.color] ?? "") ? "#161A33" : "#FFFFFF";
      ctx.fillText(b.label, b.x, b.y + 0.5);
    }
  }

  const { held } = options;
  if (held) {
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(held.x, held.y, held.r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}
