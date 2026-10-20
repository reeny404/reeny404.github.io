import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import { site } from "@/content/profile";
import { BallPit } from "@/features/ball-pit/BallPit";
import { GooglyGhosts } from "@/features/googly-ghosts/GooglyGhosts";
import { RenderDemo } from "@/features/render-demo/RenderDemo";
import { StaggerGrid } from "@/features/stagger-grid/StaggerGrid";
import { OpenPaletteButton, ShortcutTable, ThemeSwitcher } from "../system/SystemControls";
import s from "./lab.module.css";

export const metadata: Metadata = {
  title: "실험실",
  description: "이 사이트를 만들며 붙인 기능과 데모",
  alternates: { canonical: "/lab/" },
  // 지정하지 않으면 루트의 openGraph(url "/", 홈 제목)를 물려받아 공유 카드가 홈으로 보임
  openGraph: { title: "실험실", description: "이 사이트를 만들며 붙인 기능과 데모", url: "/lab/", images: ["/og.png"] },
};

function Item({
  index,
  id,
  title,
  children,
  why,
  action,
  demo,
}: {
  index: string;
  id: string;
  title: string;
  children: ReactNode;
  why?: string;
  action?: ReactNode;
  demo?: ReactNode;
}) {
  return (
    <li className={s.item} id={id} aria-labelledby={`${id}-title`} data-reveal>
      <span className={s.index} aria-hidden="true">
        {index}
      </span>
      <div className={s.body}>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{children}</p>
        {why && (
          <p className={s.why}>
            <span>살펴볼 점</span> {why}
          </p>
        )}
      </div>
      {action && <div className={s.action}>{action}</div>}
      {demo && <div className={s.demo}>{demo}</div>}
    </li>
  );
}

export default function LabPage() {
  return (
    <>
      <section className={s.hero} aria-labelledby="lab-title">
        <div className="container">
          <Eyebrow>Lab</Eyebrow>
          <h1 id="lab-title">실험실</h1>
          <p className={s.lede}>이 사이트를 만들면서 붙인 기능과 데모. 몇 개는 사례에서 쓴 구조를 작게 떼어 왔음.</p>
        </div>
      </section>

      <div className="container">
        <ol className={s.list}>
          <Item
            index="01"
            id="render"
            title="바뀐 것만 다시 그리기"
            why="PlotPlan 사례의 선택 구독 문제를 작게 옮긴 것. 노드를 눌러 두 방식의 render 횟수를 비교."
            action={<Link href="/work/plotplan/">PlotPlan 사례 →</Link>}
            demo={<RenderDemo />}
          >
            노드가 선택 배열 전체를 구독할 때와 자기 선택 여부만 구독할 때 무엇이 다른지.
          </Item>

          <Item
            index="02"
            id="stagger"
            title="파도 애니메이션"
            why="anime.js stagger로 누른 점에서 멀수록 늦게 시작. 색은 CSS 변수 하나에서 섞기 때문에 테마를 바꿔도 따로 손댈 게 없음."
            demo={<StaggerGrid />}
          >
            점을 누르면 가까운 점부터 차례로 움직임. easing과 튕김 정도를 바꿔 보면서 비교.
          </Item>

          <Item
            index="03"
            id="balls"
            title="공 던지기"
            why="공이 클수록 무거워서 작은 공에 맞아도 덜 밀림. 충돌은 가까운 공끼리만 검사하고 공이 다 멈추면 그리기도 멈춤."
            demo={<BallPit />}
          >
            바닥에 쌓인 공을 잡아서 던지면 다른 공과 부딪힘. 빈 곳을 누르면 그 주변 공을 밀어냄.
          </Item>

          <Item
            index="04"
            id="ghosts"
            title="나만 쳐다보는 유령"
            demo={<GooglyGhosts />}
          >
            유령들이 커서 쪽으로 눈을 돌림. 가끔 깜빡이고, 누르면 놀라서 폴짝 뜀.
          </Item>

          <Item
            index="05"
            id="history"
            title="언제든 되돌리기"
            why="상태를 바꾸는 조작은 전부 history.execute(command)를 거침. 도형 이동, 회전, 테마 변경이 기록 하나에 쌓이고, 슬라이더는 고른 지점까지 undo나 redo를 연달아 실행."
            action={<Link href="/">첫 화면에서 해 보기 →</Link>}
          >
            첫 화면에서 도형을 옮기고 실행 취소를 누르면 한 단계씩 돌아감. 에디터 아래 슬라이더로 기록을 앞뒤로 움직이거나 처음부터 다시 재생.
          </Item>

          <Item
            index="06"
            id="palette"
            title="단축키"
            why="페이지 이동, 테마, 실행 취소, 외부 링크를 키보드로 실행."
            action={<OpenPaletteButton />}
            demo={<ShortcutTable />}
          >
            어느 화면에서든 단축키로 여는 검색 메뉴.
          </Item>

          <Item
            index="07"
            id="theme"
            title="부드러운 테마 전환"
            why="View Transitions API로 클릭한 위치에서 원을 키워 새 테마를 보여줌. 움직임 줄이기 설정이 켜져 있거나 API를 지원하지 않는 브라우저에서는 바로 바뀜."
            action={<ThemeSwitcher />}
          >
            라이트와 다크를 바꿀 때 화면 전체가 한 번에 번쩍이지 않게 함.
          </Item>

          <Item
            index="08"
            id="system"
            title="디자인 시스템"
            why="tokens.ts 한 파일에서 CSS 변수와 문서 페이지를 같이 만듦. 색마다 WCAG 대비 비율도 계산해서 보여줌."
            action={<Link href="/system/">디자인 시스템 보기 →</Link>}
          >
            이 사이트에서 쓰는 색, 글자, 간격, 움직임, 컴포넌트 정의.
          </Item>

          <Item
            index="09"
            id="console"
            title="Console"
            action={<a href={site.repo}>소스 코드 보기 ↗</a>}
          >
            개발자 도구 콘솔을 열면 인사말이 하나 있어요. 끝까지 봐주셔서 감사합니다 :D
          </Item>
        </ol>
      </div>
    </>
  );
}
