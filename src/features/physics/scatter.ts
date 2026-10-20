import type { World } from "./world";

/** 영역 안에 겹치지 않게 무작위로 놓기. 자리가 없으면 그 공은 건너뜀 */
export function scatter(world: World, count: number, sizes: readonly number[], colors: number, area = { x: 0, y: 0, w: world.w, h: world.h }) {
  for (let i = 0; i < count; i++) {
    const r = sizes[Math.floor(Math.random() * sizes.length)];
    for (let tries = 0; tries < 40; tries++) {
      const x = area.x + r + Math.random() * (area.w - r * 2);
      const y = area.y + r + Math.random() * (area.h - r * 2);
      if (world.bodies.every((b) => (b.x - x) ** 2 + (b.y - y) ** 2 > (b.r + r + 1) ** 2)) {
        world.add(x, y, r, i % colors);
        break;
      }
    }
  }
}

/** 화면에 보이기 전에 미리 떨어뜨려 쌓인 상태로 시작 */
export function settle(world: World, seconds = 10) {
  for (let i = 0; i < seconds * 60; i++) world.step(1 / 60);
  for (const b of world.bodies) b.vx = b.vy = 0;
  world.hits = 0;
}
