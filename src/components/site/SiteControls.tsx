"use client";

import { animate, utils } from "animejs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { prefersReducedMotion, settle } from "@/features/motion/motion";
import { resolvedTheme, setTheme, useThemeChoice } from "@/features/theme/theme";
import s from "./site.module.css";

// 디자인 시스템은 실험실 안의 한 항목이라 실험실 메뉴로 표시
const NAV = [
  { href: "/#work", label: "사례", match: ["/work/"] },
  { href: "/#experience", label: "경력", match: [] },
  { href: "/lab/", label: "실험실", match: ["/lab/", "/system/"] },
  { href: "/#contact", label: "연락처", match: [] },
] as const;

/** 밑줄 막대의 기준 폭(px). 실제 폭은 scaleX로 맞춰 transform만 움직임 */
const BAR = 100;

export function SiteNav() {
  const pathname = usePathname();
  const current = NAV.findIndex((item) => item.match.some((m) => pathname.startsWith(m)));
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLLIElement>(null);
  const shown = useRef(false);

  // 현재 메뉴 밑줄 하나가 메뉴 사이를 미끄러져 이동. JS 전에는 각 링크의 ::after 밑줄이 대신 보임
  useLayoutEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;

    const place = (moving: boolean) => {
      const link = list.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!link) {
        if (shown.current) animate(bar, { opacity: 0, duration: 140, ease: "out" });
        shown.current = false;
        return;
      }
      const inset = parseFloat(getComputedStyle(link).paddingLeft);
      const to = { x: link.offsetLeft + inset, scaleX: (link.offsetWidth - inset * 2) / BAR };
      if (moving && shown.current && !prefersReducedMotion()) {
        animate(bar, { ...to, ease: settle() });
      } else {
        utils.set(bar, to);
        if (moving && !shown.current) animate(bar, { opacity: [0, 1], duration: 140, ease: "out" });
        else utils.set(bar, { opacity: 1 });
      }
      shown.current = true;
    };

    place(list.dataset.ready !== undefined);
    list.dataset.ready = "";
    const ro = new ResizeObserver(() => place(false));
    ro.observe(list);
    return () => ro.disconnect();
  }, [current]);

  return (
    <nav className={s.nav} aria-label="주요 메뉴">
      <ul ref={listRef}>
        {NAV.map((item, i) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={i === current ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
        <li ref={barRef} className={s.navBar} aria-hidden="true" />
      </ul>
    </nav>
  );
}

const subscribeNoop = () => () => {};

export function ThemeToggle() {
  const choice = useThemeChoice();
  // 서버 렌더에서는 system으로 그리고, 클라이언트에서 실제 값으로 교체
  const isDark = useSyncExternalStore(
    subscribeNoop,
    () => resolvedTheme(choice) === "dark",
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="sm"
      icon
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={(e) => setTheme(isDark ? "light" : "dark", { x: e.clientX, y: e.clientY })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        )}
      </svg>
    </Button>
  );
}
