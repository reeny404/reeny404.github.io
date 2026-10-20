"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { runSim, type Sim } from "@/features/physics/runner";
import { scatter, settle } from "@/features/physics/scatter";
import { createWorld, type World } from "@/features/physics/world";
import s from "./ball-pit.module.css";

const COLORS = ["--color-accent", "--color-decorative-coral", "--color-decorative-yellow", "--color-decorative-mint", "--color-text"];
const SIZES = [7, 9, 11, 14, 18];
/** 판 넓이 중 공이 차지하는 비율 */
const FILL = 0.135;
const MAX_BALLS = 160;
const GRAVITY = 1500;
const MAX_TILT = 40;

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

function fill(world: World) {
  world.bodies.length = 0;
  const count = Math.min(MAX_BALLS, Math.round((world.w * world.h * FILL) / (Math.PI * 121)));
  scatter(world, count, SIZES, COLORS.length);
}

/** 위쪽 절반에 다시 흩어 놓고 떨어뜨림 */
function refill(world: World) {
  fill(world);
  for (const b of world.bodies) b.y *= 0.5;
  world.hits = 0;
}

/** 중력 방향과 반대쪽 벽 가운데에서 바깥으로 밀어 튕겨 올림 */
function burstAgainstGravity(world: World) {
  const g = Math.hypot(world.gravity.x, world.gravity.y) || 1;
  const x = world.w / 2 + (world.gravity.x / g) * (world.w / 2 + 40);
  const y = world.h / 2 + (world.gravity.y / g) * (world.h / 2 + 40);
  world.burst(x, y, Math.max(world.w, world.h), 1500);
}

function setTiltGravity(world: World, gx: number, gy: number) {
  world.gravity = { x: gx, y: gy };
  world.wakeAll();
}

export function BallPit() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const simRef = useRef<Sim | null>(null);
  const [hits, setHits] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [phone, setPhone] = useState<"off" | "on" | "denied">("off");

  useEffect(() => {
    const world = createWorld();
    worldRef.current = world;
    let shown = 0;
    const sim = runSim({
      stage: stageRef.current!,
      canvas: canvasRef.current!,
      world,
      colorVars: COLORS,
      onResize(_w, _h, first) {
        if (first) {
          fill(world);
          settle(world);
        }
      },
      afterFrame() {
        if (world.hits !== shown) setHits((shown = world.hits));
      },
    });
    simRef.current = sim;
    return () => sim.destroy();
  }, []);

  // 슬라이더 각도만큼 중력 방향을 돌림
  useEffect(() => {
    const world = worldRef.current;
    if (!world || phone === "on") return;
    const a = (tilt * Math.PI) / 180;
    setTiltGravity(world, Math.sin(a) * GRAVITY, Math.cos(a) * GRAVITY);
    simRef.current?.wake();
  }, [tilt, phone]);

  // 휴대폰을 기울인 방향으로 쏟아짐. 바닥에 눕히면 중력이 거의 없어 공이 떠다님
  useEffect(() => {
    if (phone !== "on") return;
    const onOrientation = (e: DeviceOrientationEvent) => {
      const world = worldRef.current;
      if (!world || e.beta === null || e.gamma === null) return;
      const rad = Math.PI / 180;
      setTiltGravity(world, Math.sin(e.gamma * rad) * GRAVITY, Math.sin(e.beta * rad) * GRAVITY);
      simRef.current?.wake();
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [phone]);

  const togglePhone = async () => {
    if (phone === "on") {
      setPhone("off");
      return;
    }
    // iOS는 사용자 조작 안에서 권한을 받아야 기울기 값을 줌
    const request = (globalThis.DeviceOrientationEvent as unknown as OrientationPermission | undefined)?.requestPermission;
    const result = request ? await request().catch(() => "denied" as const) : "granted";
    setPhone(result === "granted" ? "on" : "denied");
  };

  const burst = () => {
    const world = worldRef.current;
    if (!world) return;
    burstAgainstGravity(world);
    simRef.current?.wake();
  };

  const reset = () => {
    const world = worldRef.current;
    if (!world) return;
    refill(world);
    setHits(0);
    simRef.current?.wake();
  };

  return (
    <figure className={s.demo}>
      <div className={s.head}>
        <p className={s.stat}>
          충돌 <strong>{hits.toLocaleString("ko-KR")}</strong>회
        </p>
        <div className={s.actions}>
          <label className={s.tilt}>
            <span>기울기</span>
            <input
              type="range"
              min={-MAX_TILT}
              max={MAX_TILT}
              step={1}
              value={tilt}
              disabled={phone === "on"}
              aria-valuetext={`${tilt}도`}
              onChange={(e) => setTilt(Number(e.target.value))}
              onDoubleClick={() => setTilt(0)}
            />
            <output>{tilt}°</output>
          </label>
          <Button size="sm" className={s.phoneOnly} aria-pressed={phone === "on"} onClick={togglePhone}>
            {phone === "denied" ? "기울기 권한 없음" : "폰 기울이기"}
          </Button>
          <Button size="sm" onClick={burst}>
            튕겨 올리기
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            다시 떨어뜨리기
          </Button>
        </div>
      </div>
      <div ref={stageRef} className={s.stage}>
        <canvas ref={canvasRef} className={s.canvas} role="img" aria-label="바닥에 쌓인 색색의 공. 공을 잡아 던지면 날아가 다른 공과 부딪히며 흩어짐" />
      </div>
      <figcaption className={s.caption}>공을 잡아 휙 던져 보세요. 빈 곳을 누르면 그 자리에서 밀어내고, 기울이면 그쪽으로 쏟아져요.</figcaption>
    </figure>
  );
}
