import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import { site } from "@/content/profile";
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
          <p className={s.lede}>이 사이트를 만들며 붙인 기능과 데모. 사례에서 쓴 구조를 작게 다시 만든 것들.</p>
        </div>
      </section>

      <div className="container">
        <ol className={s.list}>
          <Item
            index="01"
            id="render"
            title="구독 범위와 렌더 횟수"
            why="PlotPlan 사례의 선택 구독 문제를 축소한 데모. 노드를 눌러 두 방식의 render 횟수 비교."
            action={<Link href="/work/plotplan/">PlotPlan 사례 →</Link>}
            demo={<RenderDemo />}
          >
            각 노드가 선택 배열 전체를 구독할 때와 자기 선택 여부만 구독할 때의 차이.
          </Item>

          <Item
            index="02"
            id="stagger"
            title="물결처럼 번지는 점 격자"
            why="anime.js stagger가 누른 점과의 거리만큼 각 점의 시작을 늦춤. 색은 CSS 변수 하나로 섞어 테마를 바꿔도 그대로."
            demo={<StaggerGrid />}
          >
            점을 누르면 그 자리부터 물결처럼 번져 나가는 격자. 움직임 모양과 튕기는 정도를 바꿔 가며 비교.
          </Item>

          <Item
            index="03"
            id="history"
            title="모든 조작을 되돌리는 기록"
            why="상태를 바꾸는 조작은 모두 history.execute(command)를 통과. 첫 화면 도형 이동, 회전, 테마 변경이 한 기록에 쌓임."
            action={<Link href="/">첫 화면에서 해 보기 →</Link>}
          >
            첫 화면 도형을 움직인 뒤 실행 취소를 누르면 순서대로 되돌아감. 무엇을 되돌렸는지는 알림으로 표시.
          </Item>

          <Item
            index="04"
            id="palette"
            title="명령 팔레트"
            why="이동, 테마, 실행 취소, 외부 링크까지 키보드 하나로. 마우스 없이도 사이트 전체를 오가도록."
            action={<OpenPaletteButton />}
            demo={<ShortcutTable />}
          >
            어느 화면에서든 단축키로 열리는 검색형 메뉴.
          </Item>

          <Item
            index="05"
            id="theme"
            title="누른 자리에서 퍼지는 테마 전환"
            why="View Transitions API로 클릭 위치에서 원이 퍼지듯 전환. 움직임 줄이기 설정이나 미지원 브라우저에서는 즉시 적용."
            action={<ThemeSwitcher />}
          >
            라이트와 다크를 오갈 때 화면 전체가 깜빡이지 않도록 한 처리.
          </Item>

          <Item
            index="06"
            id="system"
            title="디자인 시스템"
            why="tokens.ts 한 파일에서 CSS 변수와 문서 페이지를 함께 생성. 색마다 WCAG 대비 비율을 계산해 표시."
            action={<Link href="/system/">디자인 시스템 보기 →</Link>}
          >
            이 사이트의 모든 화면이 따르는 색, 글자, 간격, 움직임과 컴포넌트 정의.
          </Item>

          <Item
            index="07"
            id="console"
            title="Console"
            action={<a href={site.repo}>소스 코드 보기 ↗</a>}
          >
            개발자 도구 콘솔을 열면 작은 인사가 기다리고 있어요. 여기까지 봐주셔서 감사합니다. :D
          </Item>
        </ol>
      </div>
    </>
  );
}
