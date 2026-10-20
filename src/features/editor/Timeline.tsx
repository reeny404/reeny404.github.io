"use client";

import { useEffect, useRef, useState } from "react";
import { history, useHistory } from "@/features/command/history";
import s from "./editor.module.css";

/** 다시 보기에서 한 단계씩 넘어가는 간격. 도형 이동 transition(220ms)이 끝나고 잠시 머무를 만큼 */
const REPLAY_STEP = 450;

/**
 * 사이트 전역 기록을 동영상처럼 앞뒤로 끄는 되감기 슬라이더.
 * 위치는 실행한 command 수(past.length)이고, 끌면 history.travel로 그 지점까지 undo/redo한다.
 * 테마 변경 같은 사이트 조작도 같은 기록이라 함께 되감긴다.
 */
export function Timeline() {
  const past = useHistory((h) => h.past);
  const future = useHistory((h) => h.future);
  const commands = [...past, ...future];
  const total = commands.length;
  const at = past.length;
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      const h = history.getSnapshot();
      if (!h.future.length) {
        setPlaying(false);
        return;
      }
      history.travel(h.past.length + 1);
    }, REPLAY_STEP);
    return () => window.clearInterval(timer.current);
  }, [playing]);

  const replay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // 끝에 있으면 처음부터, 중간이면 그 자리부터 이어서
    if (at === total) history.travel(0);
    setPlaying(true);
  };

  const current = commands[at - 1];
  const valueText = at === 0 ? `처음 상태, 기록 ${total}개` : `${at}/${total}: ${current.label}`;

  return (
    <div className={s.timeline} data-empty={total === 0 || undefined}>
      <button
        type="button"
        className={s.replay}
        aria-label={playing ? "다시 보기 멈춤" : "처음부터 다시 보기"}
        title={playing ? "멈춤" : "다시 보기"}
        disabled={total === 0}
        onClick={replay}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />}
        </svg>
      </button>

      <div className={s.track}>
        <div className={s.rail} aria-hidden="true">
          <span className={s.progress} style={{ width: total ? `${(at / total) * 100}%` : 0 }} />
          {commands.map((c, i) => (
            <span
              key={i}
              className={s.tick}
              data-scope={c.scope}
              data-done={i < at || undefined}
              style={{ left: `${((i + 1) / total) * 100}%` }}
            />
          ))}
        </div>
        <input
          type="range"
          className={s.scrub}
          min={0}
          max={total}
          step={1}
          value={at}
          disabled={total === 0}
          aria-label="조작 기록 되감기"
          aria-valuetext={valueText}
          onPointerDown={() => setPlaying(false)}
          onChange={(e) => history.travel(Number(e.target.value))}
        />
      </div>

      <span className={s.counter} aria-hidden="true">
        {total === 0 ? "도형을 움직이면 기록이 쌓여요" : `${at}/${total}`}
      </span>
    </div>
  );
}
