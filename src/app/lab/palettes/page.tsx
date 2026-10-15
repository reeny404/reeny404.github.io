import type { Metadata } from "next";
import { Button, MetricList, Note, TagList } from "@/components/ui";
import s from "./palettes.module.css";

/**
 * 임시 비교 페이지(spike). 색 조합을 고른 뒤 삭제.
 * 각 패널이 --color-* 변수를 덮어써서 실제 컴포넌트를 그 색으로 렌더링.
 */

export const metadata: Metadata = {
  title: "색 조합 비교",
  robots: { index: false, follow: false },
};

type Palette = {
  id: string;
  name: string;
  mood: string;
  vars: Record<string, string>;
  shapes: [string, string, string, string];
};

const palettes: Palette[] = [
  {
    id: "now",
    name: "지금 (비교용)",
    mood: "남색 + 청록, 차분하지만 칙칙하게 느껴지는 현재 색",
    vars: {
      bg: "#FFFFFF",
      "bg-raised": "#FFFFFF",
      "bg-sunken": "#EDF2F5",
      text: "#16324B",
      "text-muted": "#465B6B",
      line: "#C8D4DD",
      "line-subtle": "#DCE5EB",
      accent: "#006D75",
      "accent-soft": "#E4F2F1",
      caution: "#8A5A00",
      "caution-soft": "#FBF1DC",
    },
    shapes: ["#16324B", "#006D75", "#465B6B", "#C8D4DD"],
  },
  {
    id: "blue",
    name: "A. 선명한 블루",
    mood: "흰 바탕에 쨍한 일렉트릭 블루. 코랄, 옐로, 민트 포인트. 깨끗하고 생기 있는 느낌",
    vars: {
      bg: "#FFFFFF",
      "bg-raised": "#FFFFFF",
      "bg-sunken": "#F4F6FC",
      text: "#161A33",
      "text-muted": "#585F78",
      line: "#E1E5F0",
      "line-subtle": "#EBEEF6",
      accent: "#2D5BFF",
      "accent-soft": "#EBF0FF",
      caution: "#B25E00",
      "caution-soft": "#FFF4E0",
    },
    shapes: ["#2D5BFF", "#FF6B57", "#FFC233", "#22C59B"],
  },
  {
    id: "warm",
    name: "B. 크림 + 오렌지",
    mood: "아이보리 바탕에 오렌지. 블루, 그린 포인트. 종이 위 스케치 같은 따뜻한 느낌",
    vars: {
      bg: "#FFFCF7",
      "bg-raised": "#FFFFFF",
      "bg-sunken": "#FAF2E6",
      text: "#2A2118",
      "text-muted": "#6B5E50",
      line: "#EADFCF",
      "line-subtle": "#F2E9DC",
      accent: "#E8590C",
      "accent-soft": "#FFEEE2",
      caution: "#9A5B00",
      "caution-soft": "#FFF3D6",
    },
    shapes: ["#FF6A1A", "#3D7BFF", "#19B37D", "#FFC233"],
  },
  {
    id: "violet",
    name: "C. 파스텔 + 바이올렛",
    mood: "연한 라벤더 톤에 바이올렛. 핑크, 민트, 옐로 포인트. 부드럽고 장난기 있는 느낌",
    vars: {
      bg: "#FFFFFF",
      "bg-raised": "#FFFFFF",
      "bg-sunken": "#F6F3FF",
      text: "#1E1638",
      "text-muted": "#605878",
      line: "#E6E0F5",
      "line-subtle": "#EEE9FA",
      accent: "#6D4AFF",
      "accent-soft": "#EFEAFF",
      caution: "#A15C00",
      "caution-soft": "#FFF4DC",
    },
    shapes: ["#6D4AFF", "#FF7AB6", "#4DD4C0", "#FFD25E"],
  },
];

function toStyle(vars: Record<string, string>) {
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--color-${k}`, v])) as React.CSSProperties;
}

function EditorPreview({ shapes }: { shapes: Palette["shapes"] }) {
  const [a, b, c, d] = shapes;
  return (
    <svg viewBox="0 0 320 180" className={s.canvas} aria-hidden="true">
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--color-line)" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill="url(#dots)" />
      <rect x="28" y="34" width="84" height="64" rx="10" fill={a} />
      <circle cx="176" cy="66" r="34" fill={b} />
      <path d="M262 30 l12 24 26 4 -19 18 5 26 -24 -13 -24 13 5 -26 -19 -18 26 -4z" fill={c} />
      <rect x="96" y="120" width="128" height="36" rx="18" fill={d} />
      <text x="160" y="143" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">Hello</text>
      {/* 선택 상태 */}
      <rect x="139" y="29" width="74" height="74" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
      {[
        [139, 29],
        [213, 29],
        [139, 103],
        [213, 103],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width="8" height="8" rx="1.5" fill="#fff" stroke="var(--color-accent)" strokeWidth="1.5" />
      ))}
      <path d="M222 108 l0 16 4 -4 3 7 3 -1 -3 -7 6 0z" fill="var(--color-text)" stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

export default function PalettesPage() {
  return (
    <div className="container">
      <header className={s.head}>
        <h1>색 조합 비교</h1>
        <p className="muted">
          실제 사이트 컴포넌트(버튼, 수치, 노트, 태그)에 각 색을 입힌 화면. 마음에 드는 패널의 이름을 알려 주시면 tokens.ts에 반영. 비교가 끝나면 이 페이지는 삭제.
        </p>
      </header>
      <div className={s.grid}>
        {palettes.map((p) => (
          <section key={p.id} className={s.panel} style={toStyle(p.vars)} aria-labelledby={`p-${p.id}`}>
            <div className={s.panelHead}>
              <h2 id={`p-${p.id}`}>{p.name}</h2>
              <p>{p.mood}</p>
            </div>

            <div className={s.hero}>
              <span className={s.name}>
                이효현 <span>Frontend Engineer</span>
              </span>
              <p className={s.headline}>편집 데이터의 변경과 저장 책임을 나누는 설계</p>
              <div className={s.row}>
                <Button variant="primary">사례 보기</Button>
                <Button>디자인 시스템</Button>
                <a href="#" className={s.link}>
                  링크 텍스트
                </a>
              </div>
            </div>

            <EditorPreview shapes={p.shapes} />

            <MetricList
              inline
              items={[
                { label: "클릭당 render 호출", before: "2,340회", after: "1회" },
                { label: "초기 로드 CLS", before: "0.168", after: "0.003" },
              ]}
            />
            <Note label="기여 구분" tone="scope">
              FE 저장 경로 수정과 계산 통합이 본인 작업.
            </Note>
            <Note label="해석 범위" tone="caution">
              평균 FPS는 동일, 긴 프레임만 개선.
            </Note>
            <TagList items={["React", "TypeScript", "Konva"]} label="기술" />

            <ul className={s.chips} aria-label="색 값">
              {["bg", "bg-sunken", "text", "text-muted", "accent", "accent-soft"].map((k) => (
                <li key={k}>
                  <span style={{ background: p.vars[k] }} />
                  <code>{k}</code>
                  <span className={s.hex}>{p.vars[k]}</span>
                </li>
              ))}
              {p.shapes.map((c, i) => (
                <li key={c + i}>
                  <span style={{ background: c }} />
                  <code>포인트 {i + 1}</code>
                  <span className={s.hex}>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
