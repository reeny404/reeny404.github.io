export type Metric = { label: string; before: string; after: string };

export type CaseSummary = {
  slug: "plotplan" | "chipnsoda" | "miridih";
  index: string;
  title: string;
  context: string;
  headline: string;
  summary: string[];
  description: string;
  metrics?: Metric[];
  tags?: string[];
  note?: { label: string; text: string };
  /** 같은 사례 안의 장(chapter)으로 연결 */
  anchor?: string;
  linkLabel: string;
};

/** published, modified: 사례 페이지의 JSON-LD, og:article 시간, sitemap lastModified에 쓰임. 본문을 고치면 modified도 갱신 */
export const caseStudies = {
  plotplan: {
    title: "PlotPlan 에디터 V2",
    published: "2026-10-15",
    modified: "2026-10-19",
    description:
      "D3/SVG 에디터를 React + Konva로 재설계하며 document store와 command 구조, 좌표 계산과 저장 경로를 정리하고 재작성 후 회귀를 측정해 복구한 사례.",
  },
  chipnsoda: {
    title: "ChipNSoDA 실시간 작업 상태",
    published: "2026-10-15",
    modified: "2026-10-19",
    description: "AI 반도체 Floor Plan 설계 도구에서 REST 이력과 WebSocket 실시간 데이터를 하나의 화면 상태로 연결한 사례.",
  },
  miridih: {
    title: "미리캔버스 저장과 결제 안정화",
    published: "2026-10-15",
    modified: "2026-10-19",
    description: "웹 디자인 도구 미리캔버스의 저장 실패와 초기 로딩, 결제 데이터 유실을 개선한 사례.",
  },
} as const;

export const selectedWork: CaseSummary[] = [
  {
    slug: "plotplan",
    index: "01",
    title: caseStudies.plotplan.title,
    context: "애자일소다 PlotPlan · 2026.03 ~ 2026.10",
    headline: "데이터와 화면, 저장을 나눠 다시 만든 에디터",
    summary: [
      "드래그와 패널 입력의 좌표 계산이 서로 다르던 D3 에디터를 React + Konva로 재작성",
      "드래그로 옮기든 패널에 입력하든 같은 계산을 거치도록 모든 변경을 command로 처리, 실행 취소도 같은 command로 해결",
      "Canvas 객체가 저장 데이터에 섞이지 않도록 편집 데이터는 store에만 두고 화면은 store 값으로 그리도록 분리",
    ],
    description: caseStudies.plotplan.description,
    metrics: [
      { label: "장비 1개 클릭당 CanvasNode render 호출", before: "2,340회", after: "1회" },
      { label: "V2 초기 로드 CLS", before: "0.168", after: "0.003" },
      { label: "장비 768개, 끌기 시작할 때 가장 긴 프레임", before: "191.7ms", after: "83.4ms" },
    ],
    linkLabel: "PlotPlan 에디터 V2 사례",
  },
  {
    slug: "plotplan",
    anchor: "drawing-recognition",
    index: "02",
    title: "도면 인식 API 계약 제안",
    context: "애자일소다 PlotPlan · 2026.09 ~ 2026.10",
    headline: "BE API가 정해지기 전 요청, 응답과 진행률 계약을 제안하고 도면 인식 화면 흐름 개발",
    summary: [
      "같은 형태의 MSW mock으로 업로드부터 캔버스 반영까지 선개발",
      "인식 좌표와 사용자 배치 좌표를 어디서 갱신할지 BE, AI 담당자와 정리",
      "확정된 계약으로 연결부를 바꾼 뒤 실서버 테스트에서 나온 저장 409 충돌과 인식 회전 반영 처리",
    ],
    description: "",
    tags: ["MSW", "WebSocket"],
    linkLabel: "도면 인식 API 계약 제안",
  },
  {
    slug: "plotplan",
    anchor: "lead",
    index: "03",
    title: "Frontend Lead",
    context: "애자일소다 Frontend Lead · 2026.01 ~ 현재",
    headline: "개발 규칙을 문서와 자동 검사에 함께 반영",
    summary: [
      "팀 규칙을 문서에서 끝내지 않고 ESLint, MSW 요청 차단, Playwright E2E로 자동 검사",
      "FE 3인 팀의 설계와 코드 리뷰, 인턴 교육, 채용 면접",
      "고객 피드백을 FE, AI, BE 작업으로 나누고 일정과 배포 조율",
    ],
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
    summary: [
      "이미 쌓인 학습 기록은 REST, 이후 데이터는 WebSocket으로 받아 하나의 그래프로 연결",
      "소켓 연결 전 구독 요청은 대기, 버전을 바꾸면 이전 버전 데이터 초기화",
    ],
    description: caseStudies.chipnsoda.description,
    tags: ["STOMP/SockJS", "TanStack Query", "WebSocket"],
    linkLabel: "ChipNSoDA 사례",
  },
  {
    slug: "miridih",
    index: "05",
    title: caseStudies.miridih.title,
    context: "미리디 미리캔버스 · 2016.11 ~ 2021.03",
    headline: "무한 로딩으로 나타나던 저장 실패 분석과 결제 상태의 DB 중심 전환",
    summary: [
      "무한 로딩 끝에 실패하던 저장을 단계별로 나누고 이벤트 로그로 실패 지점 추적",
      "세션에 의존하던 결제 정보를 DB 기준으로 재설계하고 A/B 분기로 점진 전환",
    ],
    description: caseStudies.miridih.description,
    metrics: [
      { label: "저장 실패율", before: "18%", after: "2%" },
      { label: "초기 로딩", before: "19초", after: "4초" },
      { label: "결제 데이터 유실", before: "월 12건", after: "0건" },
    ],
    linkLabel: "미리디 사례",
  },
];
