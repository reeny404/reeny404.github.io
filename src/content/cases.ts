export type Metric = { label: string; before: string; after: string };

export type CaseSummary = {
  slug: "plotplan" | "chipnsoda" | "miridih";
  index: string;
  title: string;
  context: string;
  headline: string;
  summary: string;
  description: string;
  metrics?: Metric[];
  tags?: string[];
  note?: { label: string; text: string };
  /** 같은 사례 안의 장(chapter)으로 연결 */
  anchor?: string;
  linkLabel: string;
};

export const caseStudies = {
  plotplan: {
    title: "PlotPlan 에디터 V2",
    description:
      "D3/SVG 에디터를 React + Konva로 재설계하며 document store와 command 구조, 좌표 계산과 저장 경로를 정리하고 재작성 후 회귀를 측정해 복구한 사례.",
  },
  chipnsoda: {
    title: "ChipNSoDA 실시간 작업 상태",
    description: "AI 반도체 Floor Plan 설계 도구에서 REST 이력과 WebSocket 실시간 데이터를 하나의 화면 상태로 연결한 사례.",
  },
  miridih: {
    title: "미리캔버스 저장과 결제 안정화",
    description: "웹 디자인 도구 미리캔버스의 저장 실패와 초기 로딩, 결제 데이터 유실을 개선한 사례.",
  },
} as const;

export const selectedWork: CaseSummary[] = [
  {
    slug: "plotplan",
    index: "01",
    title: caseStudies.plotplan.title,
    context: "애자일소다 PlotPlan · 2026.03 ~ 2026.10",
    headline: "편집 데이터를 document store에서 관리하고 변경과 실행 취소를 command로 통합",
    summary:
      "D3/SVG 에디터에서 화면 조작과 편집 상태, 좌표와 저장 로직이 섞여 진입점마다 동작이 달라지는 문제에서 출발. React + Konva 기반 V2의 초기 구조 설계와 구현, 재작성 후 측정한 회귀를 원인별로 복구.",
    description: caseStudies.plotplan.description,
    metrics: [
      { label: "장비 1개 클릭당 CanvasNode render 호출", before: "2,340회", after: "1회" },
      { label: "V2 초기 로드 CLS", before: "0.168", after: "0.003" },
      { label: "장비 768개 드래그 시작 최악 프레임", before: "191.7ms", after: "83.4ms" },
    ],
    linkLabel: "PlotPlan 에디터 V2 사례",
  },
  {
    slug: "plotplan",
    anchor: "drawing-recognition",
    index: "02",
    title: "도면 인식 선개발",
    context: "애자일소다 PlotPlan · 2026.09 ~ 2026.10",
    headline: "BE 계약 확정 전에 요청, 응답과 진행률을 제안하고 도면 인식 흐름 선개발",
    summary:
      "같은 형태의 MSW mock으로 파일 업로드부터 진행 상태, 인식 결과의 캔버스 반영까지 선개발. 인식 좌표와 사용자 배치 좌표를 어느 계층에서 갱신할지 BE, AI 담당자와 정리.",
    description: "",
    tags: ["MSW", "WebSocket"],
    linkLabel: "도면 인식 선개발",
  },
  {
    slug: "plotplan",
    anchor: "lead",
    index: "03",
    title: "Frontend Lead",
    context: "애자일소다 Frontend Lead · 2026.01 ~ 현재",
    headline: "개발 규칙을 문서와 자동 검사에 함께 반영",
    summary:
      "편집 데이터와 저장 책임을 문서화하고 ESLint 규칙, MSW 미정의 요청 차단, Playwright E2E 환경으로 연결. FE 3인 팀의 설계와 코드 리뷰, 인턴 교육과 평가, FE 채용 면접, 고객 피드백에 따른 작업 배정과 배포 조율 담당.",
    description: "",
    tags: ["ESLint", "MSW", "Playwright", "코드 리뷰", "인턴 OJT"],
    linkLabel: "Frontend Lead 역할",
  },
  {
    slug: "chipnsoda",
    index: "04",
    title: caseStudies.chipnsoda.title,
    context: "애자일소다 ChipNSoDA · 2024.11 ~ 2025.04",
    headline: "REST 이력과 WebSocket 실시간 데이터를 하나의 화면 상태로 연결",
    summary:
      "AI 반도체 Floor Plan 설계 도구의 전처리, 학습, 추론 상태를 공통 socket hook과 도메인별 hook으로 연결. 연결 전 구독 요청 대기와 버전 전환 시 이전 데이터 초기화 처리.",
    description: caseStudies.chipnsoda.description,
    tags: ["STOMP/SockJS", "TanStack Query", "ECharts"],
    linkLabel: "ChipNSoDA 사례",
  },
  {
    slug: "miridih",
    index: "05",
    title: caseStudies.miridih.title,
    context: "미리디 미리캔버스 · 2016.11 ~ 2021.03",
    headline: "무한 로딩으로 나타나던 저장 실패 분석과 결제 상태의 DB 중심 전환",
    summary:
      "저장 로직을 액션 단위로 나누고 이벤트 로그로 실패 구간 분석. 세션에 의존하던 결제 상태를 DB 중심 구조로 재설계하고 A/B 분기로 점진 전환.",
    description: caseStudies.miridih.description,
    metrics: [
      { label: "저장 실패율", before: "18%", after: "2%" },
      { label: "초기 로딩", before: "19초", after: "4초" },
      { label: "결제 데이터 유실", before: "월 12건", after: "0건" },
    ],
    linkLabel: "미리디 사례",
  },
];
