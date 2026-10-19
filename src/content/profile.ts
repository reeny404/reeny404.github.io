export const site = {
  url: "https://reeny404.github.io",
  name: "이효현",
  nameEn: "Lee Hyohyeon",
  title: "이효현 | Frontend Engineer",
  description:
    "2D 공정설계 에디터의 편집 데이터와 Canvas 표현 분리, 좌표 계산과 저장 경로 설계. 웹 디자인 도구의 저장 실패와 초기 로딩, 결제 데이터 유실 개선.",
  headline: "눈앞의 버그보다, 반복되는 이유를 봅니다",
  email: "happy2hyeon@kakao.com",
  github: "https://github.com/reeny404",
  blog: "https://reeny404.tistory.com",
  repo: "https://github.com/reeny404/reeny404.github.io",
} as const;

export const experience = [
  {
    company: "애자일소다",
    companyEn: "AgileSoDA",
    periods: ["2026.01 ~ 현재", "2024.11 ~ 2025.12"],
    role: "수석연구원, Frontend Lead 역할 · 이전 Frontend Engineer, 프리랜서",
    summary: "AI 기반 플랜트 공정설계와 반도체 Floor Plan 설계 도구 개발.",
    points: [
      "PlotPlan 에디터 V2의 document store와 command 구조, 좌표 계산과 저장 경로 설계와 구현",
      "선택 렌더링 병목 진단과 재작성 후 레이아웃 회귀 복구",
      "도면 인식 기능의 FE 계약 제안과 MSW 기반 선개발",
      "ChipNSoDA의 REST 이력과 실시간 작업 상태 연결, 설계 파일과 역할별 관리 화면 구현",
    ],
  },
  {
    company: "자비스앤빌런즈",
    companyEn: "Jobis & Villains",
    periods: ["2021.03 ~ 2023.09"],
    role: "Product Manager, Core/Platform",
    summary:
      "누적 가입자 2,000만 명(2023년 기준) 세금 신고 서비스 삼쩜삼의 회원, 알림, 스크래핑, 결제 등 공통 모듈 과제 관리.",
    points: [
      "주민번호 분리보관과 스크래핑 데이터 가명화의 영향 서비스와 데이터 흐름 조사, 서비스별 작업과 일정 정의",
      "약 420만 명 규모 정기신고 사전 스크래핑의 유량 제어 계획 공동 작성, 상황실의 오류와 장애 분류, 전파 기준 정리",
      "Core/Platform 상반기 23개 과제를 협업 스쿼드와 중요도, 일정 기준으로 관리",
    ],
    scope:
      "법적 기준 결정과 서버 구현, 실제 유량 제어는 보안, 법무, 개발 담당자의 작업. 본인 담당은 실행 범위와 일정, 운영 기준 정리.",
  },
  {
    company: "미리디",
    companyEn: "Miridih",
    periods: ["2016.11 ~ 2021.03"],
    role: "Full-Stack Engineer",
    summary: "MAU 200만(2021년 기준) 웹 디자인 도구 미리캔버스의 저장, 캔버스 렌더링과 결제 기능 개발.",
    points: [
      "저장 실패율 18% → 2%, 저장 관련 VOC 비중 25% → 6%",
      "초기 로딩 19초 → 4초, 결제 데이터 유실 월 12건 → 0건",
      "상품 후기 기능과 데이터 스키마 변경, DB Migration, TypeScript 도입",
    ],
  },
] as const;

export const skills = [
  { group: "Languages & Frameworks", items: ["React", "TypeScript", "JavaScript"] },
  { group: "Graphics", items: ["Konva", "D3/SVG", "Canvas API"] },
  { group: "State Management", items: ["Zustand", "TanStack Query"] },
  { group: "Realtime", items: ["WebSocket", "STOMP/SockJS"] },
  { group: "Build & Test", items: ["Vite", "Webpack", "MSW", "Playwright"] },
] as const;

export const education = [
  { school: "한국방송통신대학교 컴퓨터과학과", period: "2018.03 ~ 2024.02 졸업" },
  { school: "부산외국어대학교 국제무역학과, 회계세무학과 복수전공", period: "2012.03 ~ 2017.07 졸업" },
] as const;

export const sideProjects = [
  {
    name: "mod-hud",
    meta: "2026.10 · TypeScript, Claude Code 플러그인",
    summary:
      "여러 Claude Code 세션 중 입력을 기다리는 세션과 작업 중인 세션, 각 브랜치의 MR 상태를 입력창 위 한 줄과 패널로 보여 주는 플러그인.",
    href: "https://github.com/reeny404/mod-hud",
  },
  {
    name: "quick-react-env",
    meta: "TypeScript, Node.js",
    summary:
      "Vite, Next.js 프로젝트 생성과 ESLint, Prettier, Husky 설정을 선택형으로 한 번에 구성하는 초기화 CLI.",
    href: "https://github.com/reeny404/quick-react-env",
  },
] as const;
