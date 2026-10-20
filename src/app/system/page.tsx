import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button, CodeFlow, Compare, DataTable, Eyebrow, MetricList, Note, TagList } from "@/components/ui";
import { contrastRatio, wcagLevel } from "@/design/contrast";
import { breakpoints, colors, layers, motion, radius, shadows, space, typography } from "@/design/tokens";
import { OpenPaletteButton, ShortcutTable, ThemeSwitcher } from "./SystemControls";
import s from "./system.module.css";

export const metadata: Metadata = {
  title: "디자인 시스템",
  description: "색, 글자, 간격, 움직임과 컴포넌트 정의",
  alternates: { canonical: "/system/" },
  openGraph: { title: "디자인 시스템", description: "색, 글자, 간격, 움직임과 컴포넌트 정의", url: "/system/", images: ["/og.png"] },
};

const colorByName = Object.fromEntries(colors.map((c) => [c.name, c]));

function ratio(fg: string, on: string | undefined, mode: "light" | "dark") {
  if (!on) return null;
  const value = contrastRatio(fg, colorByName[on][mode]);
  return { value: value.toFixed(2), level: wcagLevel(value) };
}

const TOC = [
  ["principles", "원칙"],
  ["color", "색"],
  ["type", "글자"],
  ["space", "간격과 모서리"],
  ["elevation", "그림자와 겹침"],
  ["motion", "움직임"],
  ["components", "컴포넌트"],
  ["patterns", "패턴"],
] as const;

function Block({ id, eyebrow, title, lede, children }: { id: string; eyebrow?: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={s.block} aria-labelledby={`${id}-title`} data-reveal>
      <header className={s.blockHead}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={`${id}-title`}>{title}</h2>
        {lede && <p className={s.blockLede}>{lede}</p>}
      </header>
      {children}
    </section>
  );
}

function Specimen({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <div className={s.specimen}>
      <h3>{name}</h3>
      <div className={s.specimenBody}>{children}</div>
      {note && <p className={s.specNote}>{note}</p>}
    </div>
  );
}

export default function SystemPage() {
  return (
    <>
      <section className={s.hero} aria-labelledby="system-title">
        <div className="container">
          <Eyebrow>Design System</Eyebrow>
          <h1 id="system-title">디자인 시스템</h1>
          <p className={s.lede}>
            이 사이트의 모든 화면이 따르는 기준.
          </p>
          <nav aria-label="디자인 시스템 목차" className={s.toc}>
            <ul>
              {TOC.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className={`container ${s.body}`}>
        <Block id="principles" title="원칙">
          <ol className={s.principles}>
            <li>
              <h3>구분선으로 위계</h3>
              <p>카드를 반복하지 않고 여백과 얇은 선으로 묶음. 테두리 상자는 비교, 도식, 조작할 수 있는 영역에만.</p>
            </li>
            <li>
              <h3>색은 의미에만</h3>
              <p>강조색은 변경 결과, 선택, 링크에만 사용. 컴포넌트는 hex가 아닌 semantic 토큰만 참조.</p>
            </li>
            <li>
              <h3>짧은 움직임</h3>
              <p>transform과 opacity만, 80~380ms. 움직임 줄이기 설정에서는 토큰 단계에서 0ms.</p>
            </li>
            <li>
              <h3>두 테마, 같은 기준</h3>
              <p>라이트와 다크 모두 본문 대비 AA 이상. 키보드만으로 모든 조작 가능, 터치 영역 24px 이상.</p>
            </li>
          </ol>
        </Block>

        <Block id="color" eyebrow="Foundations" title="색" lede="왼쪽은 라이트, 오른쪽은 다크 값. 텍스트 색은 배경 대비 비율과 WCAG 등급을 함께 표시.">
          <div className={s.inlineControl}>
            <ThemeSwitcher />
          </div>
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
        </Block>

        <Block id="type" eyebrow="Foundations" title="글자" lede="Pretendard Variable. 빌드할 때 사이트에 쓰인 글자만 남겨 한 파일로 제공. 숫자는 tabular-nums, 한글은 단어 단위 줄바꿈.">
          <ul className={s.typeScale}>
            {typography.scale.map((t) => (
              <li key={t.name}>
                <span className={s.typeMeta}>
                  <code>--text-{t.name}</code>
                  <span>{t.usage}</span>
                </span>
                <span className={s.typeSample} style={{ fontSize: `var(--text-${t.name})` }}>
                  {t.name === "metric" ? "1,280" : "다람쥐 헌 쳇바퀴에 타고파"}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          id="space"
          eyebrow="Foundations"
          title="간격과 모서리"
          lede={`4px 기반. 레이아웃 기준점 ${Object.entries(breakpoints)
            .map(([k, v]) => `${k} ${v}px`)
            .join(", ")}.`}
        >
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
        </Block>

        <Block
          id="elevation"
          eyebrow="Foundations"
          title="그림자와 겹침"
          lede={
            <>
              그림자는 바탕 위에 올려 둔 것과 떠 있는 것에만. 다크 모드에서는 남색 대신 검정 계열로 바뀜. 대화상자 뒤는 <code>--color-scrim</code>으로 덮음.
            </>
          }
        >
          <ul className={s.radii}>
            {shadows.map((sh) => (
              <li key={sh.name}>
                <span className={s.shadowBox} style={{ boxShadow: `var(--shadow-${sh.name})` }} />
                <code>--shadow-{sh.name}</code>
                <span>{sh.usage}</span>
              </li>
            ))}
          </ul>
          <ul className={`${s.spaceScale} ${s.layerList}`}>
            {layers.map((l) => (
              <li key={l.name}>
                <code>--layer-{l.name}</code>
                <span className={s.hex}>{l.value}</span>
                <span>{l.usage}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          id="motion"
          eyebrow="Foundations"
          title="움직임"
          lede={`줄에 마우스를 올리거나 포커스하면 해당 easing으로 이동. 길이는 ${motion.duration.map((d) => `${d.name} ${d.value}`).join(", ")}.`}
        >
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
        </Block>

        <Block id="components" eyebrow="Components" title="컴포넌트" lede="사이트 전체가 쓰는 컴포넌트를 그대로 렌더링.">
          <div className={s.specimens}>
            <Specimen name="Button" note="hover에서 테두리 강조, 누르면 0.97로 축소(80ms), 포커스는 2px accent outline. 켜고 끄는 버튼은 aria-pressed로 켜진 상태 표시.">
              <div className={s.row}>
                <Button variant="primary">저장</Button>
                <Button>취소</Button>
                <Button variant="ghost">더 보기</Button>
                <Button size="sm">작게</Button>
                <Button disabled>비활성</Button>
                <Button variant="ghost" size="sm" icon aria-pressed="true" aria-label="굵게 (켜짐)">
                  <b>B</b>
                </Button>
                <Button variant="ghost" size="sm" icon aria-pressed="false" aria-label="기울임 (꺼짐)">
                  <i>I</i>
                </Button>
              </div>
            </Specimen>

            <Specimen name="Tag">
              <TagList items={["React", "TypeScript", "Konva"]} label="예시 태그" />
            </Specimen>

            <Specimen name="Metric" note="화살표는 스크린리더에서 숨기고 “에서”로 읽힘. 두 시점의 값만 표시.">
              <MetricList
                inline
                items={[
                  { label: "폰트 파일", before: "2,009KB", after: "125KB" },
                  { label: "Lighthouse mobile", before: "74", after: "97" },
                ]}
              />
            </Specimen>

            <Specimen name="Note" note="default는 조건과 출처, scope는 범위 구분, caution은 한계와 주의.">
              <div className={s.stack}>
                <Note label="측정 조건">Lighthouse 12, mobile 기본 설정, 로컬 정적 서버.</Note>
                <Note label="범위" tone="scope">
                  첫 방문 기준. 다시 방문할 때는 캐시로 더 빠름.
                </Note>
                <Note label="주의" tone="caution">
                  느린 연결에서는 폰트가 늦게 바뀔 수 있음.
                </Note>
              </div>
            </Specimen>

            <Specimen name="DataTable" note="숫자 열은 오른쪽 정렬, 결과 값만 강조.">
              <DataTable
                caption="페이지별 Lighthouse mobile"
                columns={["페이지", "이전", "이후"]}
                numeric={[1, 2]}
                rows={[
                  ["/", "74", { value: "97", result: true }],
                  ["/system", "75", { value: "96", result: true }],
                ]}
              />
            </Specimen>

            <Specimen name="Compare">
              <Compare before={["왼쪽 위 좌표 저장", "회전할 때 위치도 보정"]} after={["중심 좌표 저장", "회전은 각도 하나만 변경"]} />
            </Specimen>

            <Specimen name="Toast" note="조작 결과를 알리고 바로 되돌릴 수 있게. hover, 포커스 중에는 사라지지 않음.">
              <div className={s.toastSample}>
                <span>되돌림: 테마 다크 → 라이트</span>
                <span className={s.toastSampleAction}>다시 실행</span>
              </div>
            </Specimen>

            <Specimen name="Command Palette" note="네이티브 dialog, combobox와 listbox 역할, 방향키와 Enter로 조작.">
              <div className={s.row}>
                <OpenPaletteButton />
              </div>
            </Specimen>

            <Specimen name="Canvas Selection" note="선택 테두리, 회전 핸들(넓은 터치 영역), 보드 위 아이콘 버튼.">
              <svg viewBox="0 0 320 150" className={s.canvasSample} aria-hidden="true">
                <rect width="320" height="150" className={s.canvasBg} />
                <g transform="translate(130 85)">
                  <rect x="-40" y="-20" width="80" height="40" rx="8" className={s.canvasShape} />
                  <rect x="-44" y="-24" width="88" height="48" rx="10" className={s.canvasSelection} />
                  <line x1="0" y1="-24" x2="0" y2="-42" className={s.canvasSelection} />
                  <circle cx="0" cy="-48" r="5" className={s.canvasHandle} />
                </g>
                <g transform="translate(248 108)">
                  <rect width="60" height="32" rx="8" className={s.canvasControl} />
                  <path d="M17 20 13 16l4-4M13 16h8a4 4 0 0 1 0 8h-2" className={s.canvasIcon} />
                  <path d="M43 20l4-4-4-4M47 16h-8a4 4 0 0 0 0 8h2" className={s.canvasIcon} />
                </g>
              </svg>
            </Specimen>
          </div>
        </Block>

        <Block id="patterns" eyebrow="Patterns" title="패턴">
          <div className={s.specimens}>
            <Specimen name="테마" note="첫 paint 전 인라인 스크립트로 저장된 테마 적용. 전환은 클릭 지점에서 퍼지는 View Transition.">
              <ThemeSwitcher />
            </Specimen>

            <Specimen name="Command와 실행 취소" note="상태를 바꾸는 조작은 command로 기록. 선택, 줌, 드래그 중 미리보기는 화면 상태라 기록하지 않음.">
              <CodeFlow label="command 흐름">{`조작 ─ command(do / undo) ─ history ─ document
                               │
                         ⌘Z: undo · ⇧⌘Z: redo`}</CodeFlow>
            </Specimen>

            <Specimen name="키보드" note="모든 조작은 키보드로도 가능. 입력창에 포커스가 있으면 실행 취소 단축키를 가로채지 않음.">
              <ShortcutTable />
            </Specimen>
          </div>
        </Block>
      </div>
    </>
  );
}
