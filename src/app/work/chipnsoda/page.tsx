import type { Metadata } from "next";
import { CaseBody, CaseHero, Chapter, ChapterTitle, Pager } from "@/components/case";
import { CodeFlow, Note } from "@/components/ui";
import { caseStudies } from "@/content/cases";

const { title, description } = caseStudies.chipnsoda;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work/chipnsoda/" },
  openGraph: { type: "article", title, description, images: ["/og.png"], url: "/work/chipnsoda/" },
};

export default function ChipNSoDAPage() {
  return (
    <>
      <CaseHero
        slug="chipnsoda"
        eyebrow="Case 02 · 애자일소다"
        title={title}
        lede="설계 파일 업로드와 전처리, AI 학습과 추론, 결과 비교로 이어지는 AI 반도체 Floor Plan 설계 도구. 이미 쌓인 결과는 REST 이력으로, 진행 중인 상태는 WebSocket으로 받아 하나의 화면 상태로 연결한 작업."
        meta={[
          ["역할", "Frontend Engineer, 프리랜서"],
          ["기간", "주요 개발과 안정화 2024.11 ~ 2025.04"],
          ["기술", "React, TypeScript, TanStack Query, STOMP/SockJS, ECharts"],
        ]}
      />
      <CaseBody>
        <Chapter id="socket" index="01 실시간 상태" title="서버 이벤트를 화면 단계로">
          <ChapterTitle>공통 socket hook과 도메인별 hook으로 전처리, 학습, 추론 상태 연결</ChapterTitle>
          <p className="prose">
            WebSocket 채널 규격은 BE에서 정의. FE에서는 STOMP/SockJS 공통 socket hook과 도메인별 hook을 구현해 전처리 진행률, 학습 metrics와 이미지, 추론 진행률, 학습 중지 요청을 각각 분리. 서버 이벤트가 어떤 화면 단계(준비, 진행, 결과)를 의미하는지 정하는 작업이 중심.
          </p>
          <ul className="prose">
            <li>소켓 연결 전에 들어온 구독 요청은 연결될 때까지 대기</li>
            <li>버전을 바꾸면 이전 버전의 socket 데이터를 비우고 현재 버전 데이터만 표시</li>
          </ul>
        </Chapter>

        <Chapter id="history" index="02 이력과 스트림" title="REST와 WebSocket의 역할 분리">
          <p className="prose">
            학습 화면에 들어오는 시점에는 이미 일부 metrics가 쌓여 있는 상황. WebSocket만 기다리면 진입 이전 데이터가 비고, REST를 주기적으로 호출하면 실시간성이 떨어지는 문제. 진입 이전의 이력은 REST로 읽고 이후 변경분만 WebSocket으로 이어 붙여 같은 chart series로 표시.
          </p>
          <CodeFlow label="이력과 실시간 데이터 결합">{`REST에 저장된 학습 이력 ────┐
                           ├─→ 학습 지표와 이미지 화면
WebSocket 실시간 데이터 ────┘`}</CodeFlow>
        </Chapter>

        <Chapter id="chart" index="03 시각화" title="학습 지표와 버전 비교">
          <p className="prose">
            실시간 학습 metrics를 차트 series로 바꾸는 데이터 계층과 학습 결과, 버전별 성능 비교 화면 구현. wirelength, congestion, density, hierarchy 값을 radar 데이터로 변환.
          </p>
          <Note label="기여 구분" tone="scope">
            기존 ECharts 공통 컴포넌트를 활용하고 확장한 범위. 라이브러리 도입과 공통 차트 기반은 기존 담당자의 작업.
          </Note>
        </Chapter>

        <Chapter id="files" index="04 설계 파일과 관리" title="비동기 작업으로서의 설계 파일">
          <p className="prose">
            설계 파일은 업로드 직후 사용할 수 없고 전처리를 거친 뒤 미리보기와 timing report 선택이 가능한 데이터. 업로드와 전처리 진행률, 미리보기, 목록과 검색, 삭제, 소유자 변경 구현. 업로드 방식이 다른 요구는 기존 화면에 덧붙이지 않고 별도 흐름으로 분리.
          </p>
          <p className="prose">
            Root 권한 전용 관리 화면에서 사용자 그룹, 사용자, 시스템 설정과 역할 기반 접근 제어 구현. 디자인 시안이 없는 화면은 BE와 생성, 수정, 삭제 범위와 권한 규칙을 정한 뒤 구현. API 모듈과 라우트, 페이지 구조를 도메인 기준으로 정비.
          </p>
          <Note label="범위">캔버스 편집 기능 자체는 기존 자산. 소켓 전체의 오류 복구나 데이터 유실 방지 보장은 주장 범위에서 제외.</Note>
        </Chapter>

        <Pager
          prev={{ href: "/work/plotplan/", label: "PlotPlan 에디터 V2", dir: "이전 사례" }}
          next={{ href: "/work/miridih/", label: "미리캔버스 저장과 결제 안정화", dir: "다음 사례" }}
        />
      </CaseBody>
    </>
  );
}
