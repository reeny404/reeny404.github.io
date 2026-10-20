"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import s from "./site.module.css";

/**
 * 어느 페이지든 오른쪽 아래에 고정된 맨 위로 버튼.
 * 화면 높이의 절반 넘게 내려왔을 때만 보이므로 404처럼 짧은 페이지에서는 나타나지 않는다.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // 키보드 사용자가 버튼에 남지 않고 페이지 처음부터 이어 가도록
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <div className={`${s.backToTop} no-print`} data-visible={visible || undefined} inert={!visible}>
      <Button size="sm" icon aria-label="맨 위로" title="맨 위로" onClick={toTop}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </Button>
    </div>
  );
}
