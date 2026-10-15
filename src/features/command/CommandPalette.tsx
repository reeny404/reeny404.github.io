"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { site } from "@/content/profile";
import { setTheme } from "@/features/theme/theme";
import { history, useHistory } from "./history";
import { isTypingTarget, palette, usePaletteOpen } from "./palette-store";
import s from "./command.module.css";

type Action = {
  id: string;
  group: "이동" | "테마" | "편집" | "외부 링크";
  label: string;
  keywords: string;
  hint?: string;
  disabled?: boolean;
  run(): void;
};

function useActions(): Action[] {
  const router = useRouter();
  const canUndo = useHistory((h) => h.past.length > 0);
  const canRedo = useHistory((h) => h.future.length > 0);

  return useMemo<Action[]>(
    () => [
      { id: "home", group: "이동", label: "처음 화면", keywords: "home 홈 메인", run: () => router.push("/") },
      { id: "plotplan", group: "이동", label: "PlotPlan 에디터 V2", keywords: "case plotplan editor konva 에디터 사례", run: () => router.push("/work/plotplan/") },
      { id: "chipnsoda", group: "이동", label: "ChipNSoDA 실시간 작업 상태", keywords: "case chipnsoda websocket 소켓 사례", run: () => router.push("/work/chipnsoda/") },
      { id: "miridih", group: "이동", label: "미리캔버스 저장과 결제 안정화", keywords: "case miridih miricanvas 미리디 사례", run: () => router.push("/work/miridih/") },
      { id: "system", group: "이동", label: "디자인 시스템", keywords: "design system tokens 토큰 컴포넌트", run: () => router.push("/system/") },
      { id: "light", group: "테마", label: "라이트 모드", keywords: "theme light 밝게", run: () => setTheme("light") },
      { id: "dark", group: "테마", label: "다크 모드", keywords: "theme dark 어둡게", run: () => setTheme("dark") },
      { id: "system-theme", group: "테마", label: "시스템 설정 따르기", keywords: "theme system auto 자동", run: () => setTheme("system") },
      { id: "undo", group: "편집", label: "실행 취소", keywords: "undo 되돌리기", hint: "⌘Z", disabled: !canUndo, run: () => history.undo() },
      { id: "redo", group: "편집", label: "다시 실행", keywords: "redo", hint: "⇧⌘Z", disabled: !canRedo, run: () => history.redo() },
      { id: "github", group: "외부 링크", label: "GitHub", keywords: "github code 코드", run: () => window.open(site.github, "_blank", "noopener") },
      { id: "repo", group: "외부 링크", label: "이 사이트의 소스 코드", keywords: "source repo 저장소", run: () => window.open(site.repo, "_blank", "noopener") },
      { id: "blog", group: "외부 링크", label: "블로그", keywords: "blog tistory 티스토리", run: () => window.open(site.blog, "_blank", "noopener") },
      { id: "mail", group: "외부 링크", label: "메일 보내기", keywords: "email contact 연락", run: () => (window.location.href = `mailto:${site.email}`) },
    ],
    [router, canUndo, canRedo],
  );
}

export function CommandPalette() {
  const open = usePaletteOpen();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const actions = useActions();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => `${a.label} ${a.keywords}`.toLowerCase().includes(q));
  }, [actions, query]);

  // 전역 단축키: ⌘K 팔레트, ⌘Z 실행 취소, ⇧⌘Z 다시 실행
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "k") {
        e.preventDefault();
        palette.toggle();
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (key === "z" && !e.shiftKey) {
        if (history.undo()) e.preventDefault();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        if (history.redo()) e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const run = (action: Action | undefined) => {
    if (!action || action.disabled) return;
    palette.close();
    action.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={s.dialog}
      aria-label="명령 팔레트"
      onClose={() => palette.close()}
      onClick={(e) => e.target === e.currentTarget && palette.close()}
    >
      <div className={s.panel}>
        <div className={s.searchRow}>
          <input
            ref={inputRef}
            className={s.input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
            aria-autocomplete="list"
            placeholder="이동, 테마, 실행 취소…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>esc</kbd>
        </div>
        <ul className={s.list} id={listId} role="listbox" aria-label="명령">
          {results.length === 0 && <li className={s.empty}>일치하는 명령 없음</li>}
          {results.map((a, i) => {
            const header = a.group !== results[i - 1]?.group ? a.group : null;
            return (
              <li key={a.id} role="presentation">
                {header && (
                  <span className={s.group} aria-hidden="true">
                    {header}
                  </span>
                )}
                <div
                  id={`${listId}-${a.id}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={a.disabled || undefined}
                  className={s.option}
                  onPointerMove={() => setActive(i)}
                  onClick={() => run(a)}
                >
                  <span>{a.label}</span>
                  {a.hint && <kbd>{a.hint}</kbd>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className={s.footer}>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 이동
          </span>
          <span>
            <kbd>↵</kbd> 실행
          </span>
          <span>이 사이트의 조작은 모두 실행 취소 가능</span>
        </p>
      </div>
    </dialog>
  );
}
