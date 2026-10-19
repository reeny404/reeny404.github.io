"use client";

import { useEffect } from "react";
import fontStats from "@/app/fonts/subset-stats.json";
import { site } from "@/content/profile";
import { editor } from "@/features/editor/store";

// 콘솔 배경은 브라우저 테마를 따르므로 본문은 기본 색을 두고, 강조에만 양쪽 테마에서 읽히는 파랑
const TITLE = "font: 700 18px/1.8 Pretendard, sans-serif; color: #4C74FF";
const BODY = "font: 400 13px/1.8 Pretendard, sans-serif";
const KEY = "font: 600 12px/1.8 ui-monospace, monospace; color: #4C74FF";

// 사이트 화면 어디에도 적지 않은 뒷이야기. 주소는 서식(%c) 밖의 별도 인자로 넘겨야 콘솔에서 링크가 됨
type Aside = { text: string; path?: string };
const asides = (mod: string): Aside[] => [
  { text: "없는 주소로 한번 가 보세요. 404 페이지도 에디터 말투로 써 뒀어요.", path: "/404" },
  { text: "사람 말고 AI가 읽으라고 쓴 소개서도 있어요.", path: "/llms.txt" },
  { text: `${mod}P로 인쇄 미리보기를 열어 보세요. 위쪽 메뉴는 빠지고 내용만 남아요.` },
  {
    text: `이 사이트 폰트에는 실제로 쓰인 글자 ${fontStats.glyphs}자만 들어 있어요. 덕분에 ${fontStats.sourceKB.toLocaleString("ko-KR")}KB가 ${fontStats.subsetKB}KB로 줄었고, 글을 고치면 빌드하면서 다시 만들어요.`,
  },
];

type ConsoleWindow = typeof window & {
  __greeted?: boolean;
  hello?: () => void;
  shuffle?: () => void;
  btw?: () => void;
};

/**
 * 명령의 응답. 문자열을 return하면 콘솔이 코드 값(따옴표와 문자열 색)으로 보여 주므로 log로 출력.
 * 콘솔은 함수의 반환값을 항상 한 줄 더 찍어서 그 아래 undefined는 남음
 */
const say = (text: string) => console.log(`%c${text}`, BODY);

/** 개발자 도구를 연 사람에게만 보이는 인사. 흩어지지 않도록 한 번의 log로 출력 */
export function ConsoleGreeting() {
  useEffect(() => {
    const w = window as ConsoleWindow;
    if (w.__greeted) return;
    w.__greeted = true;

    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const undo = mac ? "⌘Z" : "Ctrl+Z";
    const btwList = asides(mac ? "⌘" : "Ctrl+");

    // 사이트 화면에 이미 있는 안내(단축키, 실험실, 소스)는 빼고 콘솔에서만 쓸 수 있는 것만
    const commands: [string, string][] = [
      ["hello()", "메일로 인사 나누기. 커피챗도 버그 제보도 반가워요"],
      ["shuffle()", `첫 화면 도형 흩뜨리기. ${undo}면 제자리로`],
      ["btw()", "이 사이트 뒷이야기 한 토막"],
    ];
    const width = Math.max(...commands.map(([name]) => name.length)) + 2;
    const lines: [string, string][] = [
      ["%c안녕하세요, 반가워요 👋\n\n", TITLE],
      ...commands.flatMap(([name, desc], i): [string, string][] => [
        [`%c${name.padEnd(width)}`, KEY],
        [`%c${desc}${i < commands.length - 1 ? "\n" : ""}`, BODY],
      ]),
    ];
    console.log(lines.map(([text]) => text).join(""), ...lines.map(([, style]) => style));

    w.hello = () => {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("콘솔 보고 연락드려요")}`;
      say("메일 창을 열었어요. 답장은 setTimeout(0)으로 드릴게요 :D");
    };

    w.shuffle = () => {
      if (window.location.pathname !== "/") {
        // 주소는 서식(%c) 밖의 별도 인자로 넘겨야 콘솔에서 링크가 됨
        console.log("%c도형은 첫 화면에 있어요. 이 주소로 가서 shuffle()을 다시 불러 주세요.", BODY, new URL("/", window.location.origin).href);
        return;
      }
      // 에디터가 화면 밖이면 섞이는 걸 볼 수 있도록 맨 위로
      const board = document.querySelector('[aria-label^="도형 편집 캔버스"]')?.getBoundingClientRect();
      if (board && (board.bottom < board.height / 2 || board.top > window.innerHeight - board.height / 2)) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }
      editor.shuffle();
      say(`${undo} 한 번이면 제자리로 돌아와요.`);
    };

    let btwIndex = 0;
    w.btw = () => {
      const i = btwIndex % btwList.length;
      btwIndex += 1;
      const { text, path } = btwList[i];
      const count = `(${i + 1}/${btwList.length})`;
      if (path) console.log(`%c${text} ${count}`, BODY, new URL(path, window.location.origin).href);
      else say(`${text} ${count}`);
    };
  }, []);
  return null;
}
