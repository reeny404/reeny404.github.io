"use client";

import { useEffect } from "react";
import { site } from "@/content/profile";

/** 개발자 도구를 연 사람에게만 보이는 인사 */
export function ConsoleGreeting() {
  useEffect(() => {
    const w = window as typeof window & { __greeted?: boolean };
    if (w.__greeted) return;
    w.__greeted = true;
    console.log(
      "%c이효현%c  콘솔까지 열어 본 분께",
      "font: 700 20px/1.4 Pretendard, sans-serif; color: #006D75",
      "font: 400 13px/1.4 Pretendard, sans-serif; color: #465B6B",
    );
    console.log(
      [
        "이 사이트의 조작은 모두 command로 기록되어 ⌘Z로 되돌릴 수 있음.",
        "⌘K 명령 팔레트, 첫 화면 에디터, PlotPlan 사례의 render 데모도 직접 만든 것.",
        `소스: ${site.repo}`,
        `연락: ${site.email}`,
      ].join("\n"),
    );
  }, []);
  return null;
}
