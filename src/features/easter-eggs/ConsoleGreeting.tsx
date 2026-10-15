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
      "%c이효현%c  여기까지 오셨네요",
      "font: 700 20px/1.4 Pretendard, sans-serif; color: #006D75",
      "font: 400 13px/1.4 Pretendard, sans-serif; color: #465B6B",
    );
    console.log(`소스: ${site.repo}\n연락: ${site.email}`);
  }, []);
  return null;
}
