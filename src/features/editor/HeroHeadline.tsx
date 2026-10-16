"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import s from "./headline.module.css";

const TEXT = "눈앞의 버그보다,\n반복되는 이유를 봅니다";

function range(word: string) {
  const start = TEXT.indexOf(word);
  return { start, end: start + word.length };
}

/** 지우는 단어와 강조하는 단어 */
const BUG = range("버그");
const FOCUS = range("반복되는 이유");

type State = {
  /** 지금까지 입력된 글자 수. 나머지는 자리만 차지하고 보이지 않음(레이아웃 이동 없음) */
  typed: number;
  caret: number | null;
  /** 타이핑 중에는 깜빡이지 않고, 멈춰 있을 때만 깜빡임 */
  blink: boolean;
  selection: [number, number] | null;
  bugMarked: boolean;
  focusMarked: boolean;
  done: boolean;
};

const FINAL: State = { typed: TEXT.length, caret: null, blink: false, selection: null, bugMarked: true, focusMarked: true, done: true };

/** 입력 → 버그 드래그 → 빨간 취소선 → 반복되는 이유 드래그 → 파란 형광펜 → 커서 사라짐 */
function timeline(): Array<[number, Partial<State>]> {
  const steps: Array<[number, Partial<State>]> = [];
  let t = 350;
  for (let i = 1; i <= TEXT.length; i++) {
    // 고정된 흔들림으로 사람이 치는 듯한 리듬. 줄바꿈 앞에서는 잠깐 쉼
    t += TEXT[i - 1] === "\n" ? 280 : 48 + ((i * 37) % 45);
    steps.push([t, { typed: i, caret: i }]);
  }
  steps.push([(t += 120), { blink: true }]);
  steps.push([(t += 650), { caret: BUG.start, blink: false }]);
  steps.push([(t += 260), { selection: [BUG.start, BUG.start + 1], caret: BUG.start + 1 }]);
  steps.push([(t += 120), { selection: [BUG.start, BUG.end], caret: BUG.end }]);
  steps.push([(t += 400), { selection: null, bugMarked: true, blink: true }]);
  steps.push([(t += 750), { caret: FOCUS.start, blink: false }]);
  for (let i = FOCUS.start + 1; i <= FOCUS.end; i++) steps.push([(t += 45), { selection: [FOCUS.start, i], caret: i }]);
  steps.push([(t += 400), { selection: null, focusMarked: true, blink: true }]);
  steps.push([(t += 1100), FINAL]);
  return steps;
}

/** 경계(입력 위치, 커서, 선택, 표시한 단어)마다 잘라 같은 표시끼리 묶은 조각으로 그림 */
function renderText(state: State): ReactNode[] {
  const cuts = new Set([0, TEXT.length, state.typed, BUG.start, BUG.end, FOCUS.start, FOCUS.end]);
  if (state.caret !== null) cuts.add(state.caret);
  if (state.selection) state.selection.forEach((i) => cuts.add(i));
  const points = [...cuts].sort((a, b) => a - b);

  const out: ReactNode[] = [];
  const caret = (key: string) => <span key={key} className={s.caret} data-blink={state.blink} aria-hidden="true" />;

  for (let i = 0; i < points.length - 1; i++) {
    const [from, to] = [points[i], points[i + 1]];
    if (state.caret === from) out.push(caret(`caret-${from}`));
    const classes = [
      from >= state.typed && s.pending,
      state.selection && from >= state.selection[0] && to <= state.selection[1] && s.selected,
      state.bugMarked && from >= BUG.start && to <= BUG.end && s.bug,
      state.focusMarked && from >= FOCUS.start && to <= FOCUS.end && s.focus,
    ].filter(Boolean);
    const parts = TEXT.slice(from, to).split("\n");
    const content = parts.flatMap((part, j) => (j === 0 ? [part] : [<br key={`br-${from}-${j}`} />, part]));
    if (classes.length)
      out.push(
        <span key={from} className={classes.join(" ")}>
          {content}
        </span>,
      );
    else out.push(...content);
  }
  if (state.caret === TEXT.length) out.push(caret("caret-end"));
  return out;
}

/** 히어로 제목. 홈을 새로 불러올 때마다 타이핑 인트로를 보여주고, 끝나면 직접 고쳐 쓸 수 있는 텍스트 상자가 됨 */
export function HeroHeadline({ className }: { className?: string }) {
  const [state, setState] = useState<State>(FINAL);

  // paint 전에 시작 상태로 바꿔야 완성 문구가 한 번 보였다 사라지지 않음
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (root.dataset.heroIntro !== "pending") return;
    root.dataset.heroIntro = "playing";

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 인트로 여부는 브라우저에서만 알 수 있음
    setState({ typed: 0, caret: 0, blink: false, selection: null, bugMarked: false, focusMarked: false, done: false });
    const timers = timeline().map(([at, patch]) =>
      window.setTimeout(() => {
        setState((prev) => ({ ...prev, ...patch }));
        if (patch.done) delete root.dataset.heroIntro;
      }, at),
    );
    return () => {
      timers.forEach(clearTimeout);
      // StrictMode의 effect 재실행이나 인트로 도중 이탈이면 다음 mount에서 다시 재생
      if (root.dataset.heroIntro === "playing") root.dataset.heroIntro = "pending";
    };
  }, []);

  return (
    <span
      className={`${s.headline} ${className ?? ""}`}
      data-done={state.done}
      contentEditable={state.done ? "plaintext-only" : false}
      suppressContentEditableWarning
      spellCheck={false}
    >
      {renderText(state)}
    </span>
  );
}
