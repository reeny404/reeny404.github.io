"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { useIsMac } from "@/features/command/shortcuts";
import s from "./headline.module.css";

/** −/+ 버튼과 단축키가 오가는 크기 단계(px). 입력란에는 MIN~MAX 사이 아무 값이나 넣을 수 있음 */
const STEPS = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80];
const MIN = 8;
const MAX = 120;

type Format = "bold" | "italic" | "underline" | "strikeThrough";

const FORMATS: Array<{ cmd: Format; label: string; mac: string; pc: string; glyph: ReactNode }> = [
  { cmd: "bold", label: "굵게", mac: "⌘B", pc: "Ctrl B", glyph: <b>B</b> },
  { cmd: "italic", label: "기울임", mac: "⌘I", pc: "Ctrl I", glyph: <i>I</i> },
  { cmd: "underline", label: "밑줄", mac: "⌘U", pc: "Ctrl U", glyph: <u>U</u> },
  { cmd: "strikeThrough", label: "취소선", mac: "⇧⌘X", pc: "Ctrl Shift X", glyph: <s>S</s> },
];

type Status = { x: number; y: number; below: boolean; active: Record<Format, boolean>; size: number };

/** 선택 영역이 target 안에 있을 때만 범위를 돌려줌 */
function rangeIn(target: HTMLElement) {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  return target.contains(range.commonAncestorContainer) ? range : null;
}

/** 선택 시작 글자의 실제 크기(px) */
function sizeOf(range: Range) {
  const node = range.startContainer;
  const el = node instanceof HTMLElement ? node : node.parentElement;
  return el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : STEPS[0];
}

/** 현재 크기에서 한 단계 위나 아래. 단계 사이 값이면 가장 가까운 다음 단계로 */
function stepFrom(px: number, dir: 1 | -1) {
  const next = dir > 0 ? STEPS.find((v) => v > px) : [...STEPS].reverse().find((v) => v < px);
  return next ?? px;
}

const clampSize = (px: number) => Math.min(MAX, Math.max(MIN, Math.round(px)));

function format(cmd: Format) {
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand(cmd);
}

/**
 * 브라우저가 지원하는 가장 큰 크기(7)로 감싼 뒤 그 요소만 찾아 px 값으로 바꿈.
 * execCommand가 선택 안쪽의 기존 크기 지정은 정리해 주므로 겹쳐도 바깥 크기만 남음
 */
function resize(target: HTMLElement, px: number) {
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand("fontSize", false, "7");
  const size = `${px}px`;
  target.querySelectorAll<HTMLElement>('[style*="xxx-large"]').forEach((el) => (el.style.fontSize = size));
  target.querySelectorAll('font[size="7"]').forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = size;
    span.append(...font.childNodes);
    font.replaceWith(span);
  });
}

/** 편집 가능한 제목에서 글자를 선택하면 그 위에 뜨는 서식 툴바. 단축키와 붙여넣기 정리도 함께 담당 */
export function FormatToolbar({ target, enabled }: { target: RefObject<HTMLElement | null>; enabled: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [width, setWidth] = useState(0);
  /** 크기 입력란에 입력 중인 값. null이면 입력 중이 아님 */
  const [draft, setDraft] = useState<string | null>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  /** 입력란으로 포커스가 옮겨 가도 적용할 수 있도록 마지막으로 선택했던 범위 */
  const saved = useRef<Range | null>(null);
  const mac = useIsMac();

  useEffect(() => {
    const root = target.current;
    if (!root || !enabled) return;

    const update = () => {
      // 크기 입력란을 쓰는 동안에는 선택이 제목 밖으로 나가도 툴바를 유지
      if (toolbar.current?.contains(document.activeElement)) return;
      const range = rangeIn(root);
      if (!range) return setStatus(null);
      saved.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      const below = rect.top < 64;
      setStatus({
        x: rect.left + rect.width / 2,
        y: below ? rect.bottom + 8 : rect.top - 8,
        below,
        active: Object.fromEntries(FORMATS.map((f) => [f.cmd, document.queryCommandState(f.cmd)])) as Record<Format, boolean>,
        size: sizeOf(range),
      });
    };

    const step = (delta: 1 | -1) => {
      const range = rangeIn(root);
      if (!range) return;
      resize(root, stepFrom(sizeOf(range), delta));
      update();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      const mod = ev.metaKey || ev.ctrlKey;
      // 줄 바꿈은 <div> 대신 <br>로 넣어 제목 구조를 유지
      if (ev.key === "Enter") {
        ev.preventDefault();
        document.execCommand("insertLineBreak");
      } else if (mod && ev.shiftKey && ev.code === "KeyX") {
        ev.preventDefault();
        format("strikeThrough");
        update();
      } else if (mod && ev.shiftKey && (ev.code === "Period" || ev.code === "Comma")) {
        ev.preventDefault();
        step(ev.code === "Period" ? 1 : -1);
      }
    };

    // 다른 곳의 서식이 섞이지 않도록 글자만 붙여넣음
    const onPaste = (ev: ClipboardEvent) => {
      ev.preventDefault();
      document.execCommand("insertText", false, ev.clipboardData?.getData("text/plain") ?? "");
    };

    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update);
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("paste", onPaste);
    };
  }, [target, enabled]);

  // 화면 가장자리에서 잘리지 않도록 실제 폭을 재서 가로 위치를 제한
  useLayoutEffect(() => {
    if (status && toolbar.current) setWidth(toolbar.current.offsetWidth);
  }, [status]);

  if (!status) return null;
  const half = width / 2;
  const x = Math.min(Math.max(status.x, half + 8), window.innerWidth - half - 8);
  const keys = (f: (typeof FORMATS)[number]) => (mac ? f.mac : f.pc);
  const sizeKey = (dir: "." | ",") => (mac ? `⇧⌘${dir}` : `Ctrl Shift ${dir}`);
  /** 저장해 둔 선택 범위를 되살려 제목으로 포커스를 돌려줌 */
  const restore = () => {
    const root = target.current;
    const sel = document.getSelection();
    if (!root || !sel || !saved.current) return null;
    root.focus();
    sel.removeAllRanges();
    sel.addRange(saved.current);
    return root;
  };
  const setSize = (px: number) => {
    const root = restore();
    if (!root) return;
    resize(root, clampSize(px));
    setStatus({ ...status, size: clampSize(px) });
  };
  const commitDraft = () => {
    const px = Number(draft);
    setDraft(null);
    if (draft && Number.isFinite(px) && px > 0) setSize(px);
    else restore();
  };

  return createPortal(
    <div
      ref={toolbar}
      className={s.toolbar}
      data-below={status.below}
      style={{ left: x, top: status.y }}
      role="toolbar"
      aria-label="텍스트 서식"
      // 버튼을 눌러도 제목의 선택 영역과 포커스가 그대로 남도록. 크기 입력란만 포커스를 받음
      onMouseDown={(ev) => ev.target instanceof HTMLInputElement || ev.preventDefault()}
    >
      {FORMATS.map((f) => (
        <Button
          key={f.cmd}
          variant="ghost"
          size="sm"
          icon
          aria-label={f.label}
          aria-pressed={status.active[f.cmd]}
          title={`${f.label} (${keys(f)})`}
          onClick={() => {
            format(f.cmd);
            setStatus({ ...status, active: { ...status.active, [f.cmd]: document.queryCommandState(f.cmd) } });
          }}
        >
          <span className={s.glyph}>{f.glyph}</span>
        </Button>
      ))}
      <span className={s.toolDivider} aria-hidden="true" />
      <Button
        variant="ghost"
        size="sm"
        icon
        aria-label="글자 작게"
        title={`글자 작게 (${sizeKey(",")})`}
        disabled={status.size <= STEPS[0]}
        onClick={() => setSize(stepFrom(status.size, -1))}
      >
        <span className={s.glyph}>
          A<sup>−</sup>
        </span>
      </Button>
      <label className={s.toolSize}>
        <input
          type="text"
          inputMode="numeric"
          aria-label={`글자 크기(px), ${MIN}~${MAX}`}
          title="글자 크기(px). Enter로 적용, ↑↓로 1px씩"
          value={draft ?? status.size}
          onFocus={(ev) => {
            setDraft(String(status.size));
            ev.currentTarget.select();
          }}
          onChange={(ev) => setDraft(ev.target.value.replace(/\D/g, "").slice(0, 3))}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              commitDraft();
            } else if (ev.key === "Escape") {
              ev.preventDefault();
              setDraft(null);
              restore();
            } else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
              ev.preventDefault();
              setDraft(String(clampSize(Number(draft || status.size) + (ev.key === "ArrowUp" ? 1 : -1))));
            }
          }}
          onBlur={() => setDraft(null)}
        />
        px
      </label>
      <Button
        variant="ghost"
        size="sm"
        icon
        aria-label="글자 크게"
        title={`글자 크게 (${sizeKey(".")})`}
        disabled={status.size >= STEPS[STEPS.length - 1]}
        onClick={() => setSize(stepFrom(status.size, 1))}
      >
        <span className={s.glyph}>
          A<sup>+</sup>
        </span>
      </Button>
    </div>,
    document.body,
  );
}
