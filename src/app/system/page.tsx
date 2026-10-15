import type { Metadata } from "next";
import { Button, Compare, DataTable, Eyebrow, MetricList, Note, TagList } from "@/components/ui";
import { contrastRatio, wcagLevel } from "@/design/contrast";
import { breakpoints, colors, motion, radius, space, typography } from "@/design/tokens";
import s from "./system.module.css";

export const metadata: Metadata = {
  title: "디자인 시스템",
  description: "이 사이트의 디자인 토큰과 컴포넌트. tokens.ts 하나에서 CSS 변수와 이 문서를 함께 생성하고 색 대비를 빌드 시점에 계산.",
  alternates: { canonical: "/system/" },
};

const colorByName = Object.fromEntries(colors.map((c) => [c.name, c]));

function ratio(fg: string, on: string | undefined, mode: "light" | "dark") {
  if (!on) return null;
  const bg = colorByName[on];
  const value = contrastRatio(fg, bg[mode]);
  return { value: value.toFixed(2), level: wcagLevel(value) };
}

const SECTIONS = [
  ["principles", "원칙"],
  ["color", "색"],
  ["type", "글자"],
  ["space", "간격과 모서리"],
  ["motion", "움직임"],
  ["components", "컴포넌트"],
  ["writing", "문구"],
] as const;

export default function SystemPage() {
  return (
    <>
      <section className={s.hero} aria-labelledby="system-title">
        <div className="container">
          <Eyebrow>Design System</Eyebrow>
          <h1 id="system-title">이 사이트를 만든 규칙</h1>
          <p className={s.lede}>
            <code>src/design/tokens.ts</code> 하나가 원본. 빌드할 때 CSS 변수와 이 페이지가 같은 객체에서 만들어지고, 텍스트 색의 대비 비율도 그때 계산. 문서와 실제 화면의 값이 어긋날 수 없는 구조.
          </p>
          <nav aria-label="디자인 시스템 목차" className={s.toc}>
            <ul>
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className={`container ${s.body}`}>
        <section id="principles" className={s.block} aria-labelledby="principles-title">
          <h2 id="principles-title">원칙</h2>
          <ol className={s.principles}>
            <li>
              <h3>카드 반복 대신 여백과 구분선</h3>
              <p>사례와 경력은 행으로 구분. 테두리 상자는 비교, 도식, 데모에만 사용.</p>
            </li>
            <li>
              <h3>수치 옆에 조건</h3>
              <p>전후 수치가 있는 곳에는 같은 화면에 측정 조건과 해석 범위를 함께 배치.</p>
            </li>
            <li>
              <h3>기여 범위 표시</h3>
              <p>팀원과 다른 직군의 작업은 scope 노트, 한계와 진행 상태는 caution 노트로 분리.</p>
            </li>
            <li>
              <h3>지연 없는 움직임</h3>
              <p>transform과 opacity만 움직이고 200ms 안팎으로 마무리. 줄인 움직임 설정에서는 0ms.</p>
            </li>
          </ol>
        </section>

        <section id="color" className={s.block} aria-labelledby="color-title">
          <h2 id="color-title">색</h2>
          <p className={s.blockLede}>
            컴포넌트는 semantic 토큰만 참조. 다크 모드는 시스템 설정을 따름.
          </p>
          <ul className={s.swatches}>
            {colors.map((c) => {
              const on = "on" in c ? c.on : undefined;
              const light = ratio(c.light, on, "light");
              const dark = ratio(c.dark, on, "dark");
              return (
                <li key={c.name} className={s.swatch}>
                  <div className={s.chips} aria-hidden="true">
                    <span style={{ background: c.light }} />
                    <span style={{ background: c.dark }} />
                  </div>
                  <code className={s.tokenName}>--color-{c.name}</code>
                  <span className={s.usage}>{c.usage}</span>
                  <span className={s.hex}>
                    {c.light} / {c.dark}
                  </span>
                  {light && dark && (
                    <span className={s.contrast}>
                      on {on}: {light.value} <b data-level={light.level}>{light.level}</b> · {dark.value}{" "}
                      <b data-level={dark.level}>{dark.level}</b>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section id="type" className={s.block} aria-labelledby="type-title">
          <h2 id="type-title">글자</h2>
          <p className={s.blockLede}>
            Pretendard Variable을 직접 호스팅하고 unicode-range로 나눠 필요한 글자 묶음만 다운로드. 숫자는 tabular-nums로 자리 맞춤, 한글은 단어 단위 줄바꿈.
          </p>
          <ul className={s.typeScale}>
            {typography.scale.map((t) => (
              <li key={t.name}>
                <span className={s.typeMeta}>
                  <code>--text-{t.name}</code>
                  <span>{t.usage}</span>
                </span>
                <span className={s.typeSample} style={{ fontSize: `var(--text-${t.name})` }}>
                  {t.name === "metric" ? "2,340 → 1" : "편집 데이터의 기준"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section id="space" className={s.block} aria-labelledby="space-title">
          <h2 id="space-title">간격과 모서리</h2>
          <p className={s.blockLede}>4px 기반 간격. 레이아웃 기준점은 {Object.entries(breakpoints).map(([k, v]) => `${k} ${v}px`).join(", ")}.</p>
          <ul className={s.spaceScale}>
            {space.map(([k, v]) => (
              <li key={k}>
                <code>--space-{k}</code>
                <span className={s.spaceBar} style={{ width: `var(--space-${k})` }} />
                <span className={s.hex}>{v}</span>
              </li>
            ))}
          </ul>
          <ul className={s.radii}>
            {Object.entries(radius).map(([k, v]) => (
              <li key={k}>
                <span className={s.radiusBox} style={{ borderRadius: v }} />
                <code>--radius-{k}</code>
              </li>
            ))}
          </ul>
        </section>

        <section id="motion" className={s.block} aria-labelledby="motion-title">
          <h2 id="motion-title">움직임</h2>
          <p className={s.blockLede}>각 줄에 마우스를 올리거나 포커스하면 해당 easing으로 이동. 길이는 {motion.duration.map((d) => `${d.name} ${d.value}`).join(", ")}.</p>
          <ul className={s.motionList}>
            {motion.easing.map((e) => (
              <li key={e.name} tabIndex={0} className={s.motionRow} style={{ "--ease": `var(--ease-${e.name})` } as React.CSSProperties}>
                <span className={s.typeMeta}>
                  <code>--ease-{e.name}</code>
                  <span>{e.usage}</span>
                </span>
                <span className={s.track}>
                  <span className={s.ball} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section id="components" className={s.block} aria-labelledby="components-title">
          <h2 id="components-title">컴포넌트</h2>
          <p className={s.blockLede}>사이트 전체가 쓰는 같은 컴포넌트를 그대로 렌더링.</p>

          <div className={s.specimen}>
            <h3>Button</h3>
            <div className={s.row}>
              <Button variant="primary">Primary</Button>
              <Button>Default</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <Button disabled>Disabled</Button>
            </div>
            <p className={s.specNote}>hover에서 테두리 강조, 누르면 0.97 축소(80ms), 포커스는 2px accent outline.</p>
          </div>

          <div className={s.specimen}>
            <h3>Metric</h3>
            <MetricList
              inline
              items={[
                { label: "클릭당 render 호출", before: "2,340회", after: "1회" },
                { label: "초기 로드 CLS", before: "0.168", after: "0.003" },
              ]}
            />
            <p className={s.specNote}>화살표는 스크린리더에서 숨기고 “에서”로 읽힘. 확인된 두 시점만 표시하고 배율 표현은 사용하지 않음.</p>
          </div>

          <div className={s.specimen}>
            <h3>Note</h3>
            <div className={s.stack}>
              <Note label="측정 조건">기본. 측정 환경과 출처.</Note>
              <Note label="기여 구분" tone="scope">
                scope. 직접 담당 범위와 다른 사람의 작업 구분.
              </Note>
              <Note label="해석 범위" tone="caution">
                caution. 수치의 한계와 진행 중인 상태.
              </Note>
            </div>
          </div>

          <div className={s.specimen}>
            <h3>Tag, Compare</h3>
            <TagList items={["React", "TypeScript", "Konva"]} label="예시 기술" />
            <Compare before={["UI별로 나뉜 좌표 계산"]} after={["command 계층에서 한 번 계산"]} />
          </div>

          <div className={s.specimen}>
            <h3>DataTable</h3>
            <DataTable
              caption="숫자 열 오른쪽 정렬, 결과 강조"
              columns={["지표", "전", "후"]}
              numeric={[1, 2]}
              rows={[["CLS", "0.168", { value: "0.003", result: true }]]}
            />
          </div>
        </section>

        <section id="writing" className={s.block} aria-labelledby="writing-title">
          <h2 id="writing-title">문구</h2>
          <ul className={s.writing}>
            <li>문장 끝은 명사형. 예: 구조 설계, API 연결.</li>
            <li>이름 옆에 직무가 있으므로 소개에서 직무를 다시 선언하지 않음.</li>
            <li>실제 코드와 화면의 이름 사용. 지어낸 용어와 비유, 의인화 금지.</li>
            <li>원인, 증상, 변경 내용과 측정 조건을 생략하지 않음. 근거가 충돌하는 수치는 싣지 않음.</li>
            <li>공개하지 않는 것: 전화번호, 고객사명, 내부 도메인, 이슈와 커밋 번호, 회사 제품 화면.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
