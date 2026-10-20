"use client";

import { animate, stagger } from "animejs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { prefersReducedMotion, reveal } from "./motion";

/**
 * [data-reveal]이 화면에 들어올 때 아래에서 떠오르게 함. data-reveal="children"이면 자식이 차례로.
 *
 * - 서버 HTML에는 상태가 없어 JS가 없거나 늦어도 내용은 그대로 보임
 * - 처음 그릴 때 이미 화면에 있는 요소는 건드리지 않음. 숨겼다 다시 보이면 깜빡이고 LCP가 늦어짐
 * - 화면 아래 요소만 data-reveal-state="pending"(CSS에서 opacity 0)으로 두었다가 보일 때 재생
 * - 끝나면 anime.js가 남긴 inline 스타일을 지워 hover 등 원래 CSS가 그대로 동작
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const fold = window.innerHeight * 0.92;
    const pending: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      const state = el.dataset.revealState;
      if (state === "done") continue;
      // effect가 다시 실행되면(개발 모드 Strict Mode 등) 이미 숨긴 요소를 다시 관찰
      if (state === "pending") {
        pending.push(el);
        continue;
      }
      if (el.getBoundingClientRect().top < fold) {
        el.dataset.revealState = "done";
      } else {
        el.dataset.revealState = "pending";
        pending.push(el);
      }
    }
    if (!pending.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entered = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        entered.forEach((el, i) => {
          io.unobserve(el);
          play(el, Math.min(i * reveal.step, reveal.maxDelay));
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    pending.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

function play(el: HTMLElement, start: number) {
  const targets = el.dataset.reveal === "children" ? Array.from(el.children) : el;
  const anim = animate(targets, {
    opacity: [0, 1],
    y: [reveal.rise, 0],
    duration: reveal.duration,
    ease: "out(3)",
    delay: stagger(reveal.step, { start }),
    onComplete: () => {
      el.dataset.revealState = "done";
      anim.revert();
    },
  });
}
