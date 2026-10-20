/**
 * 공 물리. 실험실의 공 판, 홈의 기술 공, 404, 콘솔 rain()이 함께 쓴다.
 * - 질량은 공의 부피처럼 반지름 세제곱. 큰 공은 버티고 작은 공은 멀리 튕겨 나감
 * - 충돌은 충격량과 겹친 만큼 밀어내기. 공끼리는 가장 큰 공 지름 크기의 격자 칸으로 이웃끼리만 검사
 * - 잡은 공(held)과 고정한 공(pinned)은 질량이 무한한 것처럼 다뤄 다른 공을 밀어냄
 * - 선분(segment)은 반지름이 있는 고정 장애물. 404 보드의 도형
 * - 쌓인 공은 중력과 밀어내기가 맞서 계속 미세하게 떨리므로, 한동안 거의 움직이지 않은 공은 잠재움(asleep).
 *   잠든 공은 고정처럼 다루다가 빠른 공이 부딪히거나 잡은 공이 닿거나 밀어내면 깨어남
 */

/** 한 프레임에 이보다 덜 움직이고 이보다 느린 상태가 SLEEP_FRAMES 이어지면 잠듦 */
const SLEEP_MOVE = 0.2;
const SLEEP_SPEED = 30;
const SLEEP_FRAMES = 20;
/** 이보다 빠른 공이 닿으면 잠든 공이 깸(px/s) */
const WAKE_SPEED = 120;

export type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 질량의 역수. 0이면 움직이지 않음 */
  inv: number;
  /** 색 목록의 순서 */
  color: number;
  label?: string;
  pinned?: boolean;
  asleep?: boolean;
  /** 거의 움직이지 않은 프레임 수 */
  still?: number;
};

export type Segment = { ax: number; ay: number; bx: number; by: number; r: number };

export type WorldOptions = {
  gravity?: number;
  /** 공끼리 반발 계수 */
  restitution?: number;
  /** 옆벽과 바닥 반발 계수 */
  wall?: number;
  floor?: number;
  /** 공기 저항과 벽에 닿아 구르는 저항(1/s) */
  air?: number;
  roll?: number;
  substeps?: number;
  /** 이보다 빠르게 부딪힌 것만 충돌 횟수로 셈(px/s) */
  countHit?: number;
  /** 위쪽 벽 없이 화면 위에서 떨어져 들어올 수 있게 */
  openTop?: boolean;
  /** 질량 기준이 되는 반지름. 이 크기의 공이 inv 1 */
  refR?: number;
};

export type World = ReturnType<typeof createWorld>;

export function createWorld(options: WorldOptions = {}) {
  const cfg = {
    gravity: 1500,
    restitution: 0.55,
    wall: 0.5,
    floor: 0.4,
    air: 0.15,
    roll: 2.5,
    substeps: 8,
    countHit: 200,
    openTop: false,
    refR: 11,
    ...options,
  };

  const world = {
    w: 0,
    h: 0,
    bodies: [] as Body[],
    segments: [] as Segment[],
    held: null as Body | null,
    /** 방향을 바꾸면 기울인 것처럼 쏟아짐 */
    gravity: { x: 0, y: cfg.gravity },
    hits: 0,
    add(x: number, y: number, r: number, color: number, label?: string) {
      const b: Body = { x, y, vx: 0, vy: 0, r, inv: (cfg.refR / r) ** 3, color, label };
      world.bodies.push(b);
      return b;
    },
    step,
    burst,
    /** 받치던 공이 빠지거나 중력이 바뀌면 잠든 공이 허공에 떠 있지 않도록 모두 깨움 */
    wakeAll() {
      for (const b of world.bodies) wake(b);
    },
  };

  const wake = (b: Body) => {
    b.asleep = false;
    b.still = 0;
  };
  const fixed = (b: Body) => b === world.held || b.pinned === true || b.asleep === true;
  const weight = (b: Body) => (fixed(b) ? 0 : b.inv);

  function resolve(a: Body, b: Body) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const min = a.r + b.r;
    const d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 === 0) return;
    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;
    // 잠든 공은 잡은 공이 닿거나 빠른 공이 부딪힐 때만 깸. 천천히 내려앉는 공은 그대로 받침
    if (a.asleep !== b.asleep) {
      const [sleeper, other] = a.asleep ? [a, b] : [b, a];
      if (other === world.held || Math.hypot(other.vx, other.vy) > WAKE_SPEED) wake(sleeper);
    }
    const wa = weight(a);
    const wb = weight(b);
    const w = wa + wb;
    if (w === 0) return;
    const push = (min - d) / w;
    a.x -= nx * push * wa;
    a.y -= ny * push * wa;
    b.x += nx * push * wb;
    b.y += ny * push * wb;
    const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (closing >= 0) return;
    const j = (-(1 + cfg.restitution) * closing) / w;
    a.vx -= j * wa * nx;
    a.vy -= j * wa * ny;
    b.vx += j * wb * nx;
    b.vy += j * wb * ny;
    if (-closing > cfg.countHit) world.hits++;
  }

  function collideBodies() {
    const { bodies } = world;
    let maxR = 1;
    for (const b of bodies) if (b.r > maxR) maxR = b.r;
    const cell = maxR * 2;
    const cols = Math.ceil(world.w / cell) + 1;
    const rows = Math.ceil(world.h / cell) + 2;
    const grid = new Map<number, Body[]>();
    for (const b of bodies) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(b.x / cell)));
      // 위가 열려 있으면 화면 위의 공은 맨 윗줄 칸에 모음
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(b.y / cell) + 1));
      const key = cy * cols + cx;
      const list = grid.get(key);
      if (list) list.push(b);
      else grid.set(key, [b]);
    }
    for (const [key, here] of grid) {
      const cx = key % cols;
      const cy = (key - cx) / cols;
      // 오른쪽, 아래 방향 이웃만 보면 모든 쌍을 한 번씩 검사
      for (const [ox, oy] of [[0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] as const) {
        const nx = cx + ox;
        if (nx < 0 || nx >= cols) continue;
        const there = ox === 0 && oy === 0 ? here : grid.get((cy + oy) * cols + nx);
        if (!there) continue;
        for (let i = 0; i < here.length; i++) {
          for (let j = there === here ? i + 1 : 0; j < there.length; j++) resolve(here[i], there[j]);
        }
      }
    }
  }

  function collideSegments(b: Body) {
    for (const s of world.segments) {
      const sx = s.bx - s.ax;
      const sy = s.by - s.ay;
      const len2 = sx * sx + sy * sy;
      const t = len2 ? Math.min(1, Math.max(0, ((b.x - s.ax) * sx + (b.y - s.ay) * sy) / len2)) : 0;
      const dx = b.x - (s.ax + sx * t);
      const dy = b.y - (s.ay + sy * t);
      const min = b.r + s.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      b.x += nx * (min - d);
      b.y += ny * (min - d);
      const vn = b.vx * nx + b.vy * ny;
      if (vn >= 0) continue;
      b.vx -= (1 + cfg.wall) * vn * nx;
      b.vy -= (1 + cfg.wall) * vn * ny;
      if (-vn > cfg.countHit) world.hits++;
    }
  }

  /** 벽에서 튕김. 중력이 향하는 벽은 바닥처럼 덜 튕기고, 살짝 닿으면 그대로 앉음 */
  const bounce = (speed: number, floor: boolean) => (floor ? (speed < 60 ? 0 : speed * cfg.floor) : speed * cfg.wall);

  function walls(b: Body, rollK: number) {
    const g = world.gravity;
    const strong = Math.hypot(g.x, g.y) * 0.3;
    let touching = false;
    const left = b.r;
    const right = world.w - b.r;
    if (b.x < left) {
      b.x = left;
      b.vx = bounce(Math.abs(b.vx), g.x < -strong);
      touching = true;
    } else if (b.x > right) {
      b.x = right;
      b.vx = -bounce(Math.abs(b.vx), g.x > strong);
      touching = true;
    }
    if (b.y > world.h - b.r) {
      b.y = world.h - b.r;
      b.vy = -bounce(Math.abs(b.vy), g.y > strong);
      touching = true;
    } else if (!cfg.openTop && b.y < b.r) {
      b.y = b.r;
      b.vy = bounce(Math.abs(b.vy), g.y < -strong);
      touching = true;
    }
    if (touching) {
      b.vx *= rollK;
      b.vy *= rollK;
    }
  }

  function step(dt: number) {
    // 잡은 공은 runner가 포인터 쪽으로 향하는 속도를 넣어 두고, 중력 없이 그 속도로만 움직임
    const { held } = world;
    const h = dt / cfg.substeps;
    const air = Math.exp(-cfg.air * h);
    const roll = Math.exp(-cfg.roll * h);
    const start = world.bodies.map((b) => [b.x, b.y]);
    for (let s = 0; s < cfg.substeps; s++) {
      for (const b of world.bodies) {
        if (b.pinned || b.asleep) continue;
        if (b !== held) {
          b.vx = (b.vx + world.gravity.x * h) * air;
          b.vy = (b.vy + world.gravity.y * h) * air;
        }
        b.x += b.vx * h;
        b.y += b.vy * h;
        if (world.segments.length && b !== held) collideSegments(b);
        walls(b, roll);
      }
      collideBodies();
      // 공이 많으면 서로 밀어 장애물 안으로 파고들 수 있어 한 번 더 밀어냄
      if (world.segments.length) for (const b of world.bodies) if (!fixed(b)) collideSegments(b);
    }
    world.bodies.forEach((b, i) => {
      if (b.asleep || b.pinned || b === held) return;
      const moved = Math.max(Math.abs(b.x - start[i][0]), Math.abs(b.y - start[i][1]));
      b.still = moved < SLEEP_MOVE && Math.hypot(b.vx, b.vy) < SLEEP_SPEED ? (b.still ?? 0) + 1 : 0;
      if (b.still >= SLEEP_FRAMES) {
        b.asleep = true;
        b.vx = b.vy = 0;
      }
    });
  }

  /** (x, y)에서 바깥으로 밀어냄. 같은 힘이면 가벼운 공이 더 빨리, 너무 작은 공이 튀어 나가지 않게 상한 */
  function burst(x: number, y: number, radius: number, power: number) {
    for (const b of world.bodies) {
      if (b === world.held || b.pinned) continue;
      const dx = b.x - x;
      const dy = b.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > radius) continue;
      wake(b);
      const f = (1 - d / radius) * power * Math.min(b.inv, 2.5);
      b.vx += (dx / d) * f;
      b.vy += (dy / d) * f;
    }
  }

  return world;
}
