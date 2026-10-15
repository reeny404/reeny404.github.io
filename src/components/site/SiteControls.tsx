"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { palette } from "@/features/command/palette-store";
import { resolvedTheme, setTheme, useThemeChoice } from "@/features/theme/theme";
import s from "./site.module.css";

const NAV = [
  { href: "/#work", label: "사례", match: "/work/" },
  { href: "/system/", label: "디자인 시스템", match: "/system/" },
  { href: "/#experience", label: "경력", match: null },
  { href: "/#contact", label: "연락", match: null },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className={s.nav} aria-label="주요 메뉴">
      <ul>
        {NAV.map((item) => {
          const current = item.match !== null && pathname.startsWith(item.match);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const subscribeNoop = () => () => {};

function useIsMac() {
  return useSyncExternalStore(
    subscribeNoop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
}

export function PaletteButton() {
  const mac = useIsMac();
  return (
    <Button variant="ghost" size="sm" onClick={() => palette.open()} aria-keyshortcuts="Meta+K Control+K">
      <span className={s.paletteLabel}>명령</span>
      <span className="visually-hidden">팔레트 열기</span>
      <kbd>{mac ? "⌘K" : "Ctrl K"}</kbd>
    </Button>
  );
}

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
