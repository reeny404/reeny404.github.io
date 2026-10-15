"use client";

import { history, useHistory } from "./history";
import { useShortcutLabels } from "./shortcuts";
import s from "./command.module.css";

const VERB = { do: "실행", undo: "되돌림", redo: "다시 실행" } as const;

/**
 * 실행 취소와 다시 실행 결과를 알려 주는 토스트.
 * 표시 시간은 타이머 상태 대신 CSS animation으로 처리하고, 새 기록마다 key로 다시 시작한다.
 */
export function HistoryToast() {
  const last = useHistory((h) => h.last);
  // 에디터 데모의 드래그마다 토스트가 뜨지 않도록, 실행(do)은 사이트 조작만 알린다
  const show = last && (last.kind !== "do" || last.scope === "site");
  const canUndo = last?.kind !== "undo";
  const keys = useShortcutLabels();

  return (
    <div role="status" aria-live="polite" className={s.toastRegion}>
      {show && (
        <div key={last.at} className={s.toast}>
          <span>
            {VERB[last.kind]}: {last.label}
          </span>
          <button
            type="button"
            className={s.toastAction}
            onClick={() => (canUndo ? history.undo() : history.redo())}
          >
            {canUndo ? `실행 취소 ${keys.undo}` : `다시 실행 ${keys.redo}`}
          </button>
        </div>
      )}
    </div>
  );
}
