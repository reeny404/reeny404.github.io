# Design System

이효현 포트폴리오 사이트의 디자인 기준. 토큰은 `assets/css/tokens.css`, 기본 요소는 `assets/css/base.css`, 컴포넌트는 `assets/css/components.css`.

대상은 Senior Frontend Engineer, Frontend Lead 채용 담당자와 기술 면접관. 사례마다 문제와 구조 판단, 직접 담당 범위, 측정 조건을 빠르게 확인하고 질문을 시작할 수 있는 화면이 목표. PDF 포트폴리오(`career-research/portfolio/portfolio-design-system.md`)의 밝은 종이, 남색 제목, 청록 결과 방향을 웹으로 옮긴 버전.

## 원칙

1. **카드 반복 대신 여백과 얇은 구분선.** 사례 목록과 경력은 행(row) 단위로 구분. 테두리 상자는 기존/변경 비교와 흐름 도식에만 사용.
2. **수치 옆에 조건.** 전후 수치(`metric`)를 쓰는 곳에는 같은 화면에 측정 조건(`note`)이나 사례 링크 배치.
3. **기여 범위 표시.** 팀원과 다른 직군의 작업은 `note--scope`, 해석 한계와 진행 상태는 `note--caution`으로 분리.
4. **실제 화면 대신 도식.** 공개 저장소이므로 회사 제품 캡처와 영상은 쓰지 않고 HTML 도식과 표로 구조 설명.
5. **자동 재생과 장식 애니메이션 없음.** 움직임은 hover 색 전환과 앵커 스크롤만. `prefers-reduced-motion`에서 0ms.

## Tokens

### Color

컴포넌트는 semantic 토큰만 참조. primitive 값은 `tokens.css` 안에서만 사용.

| Semantic | Light | Dark | 용도 |
| --- | --- | --- | --- |
| `--color-bg` | `#FFFFFF` | `#0F1C28` | 페이지 바탕 |
| `--color-bg-sunken` | `#EDF2F5` | `#16273A` | 도식, 코드 흐름 바탕 |
| `--color-text` | `#16324B` | `#E6EDF2` | 제목, 본문 |
| `--color-text-muted` | `#465B6B` | `#A3B4C2` | 보조 설명, 수정 전 수치 |
| `--color-line` | `#C8D4DD` | `#2C4256` | 구분선, 테두리 |
| `--color-accent` | `#006D75` | `#5FC4C9` | 변경 결과, 라벨, 링크 밑줄 |
| `--color-accent-soft` | `#E4F2F1` | `#143A40` | 직접 담당 범위 강조 바탕 |
| `--color-caution` | `#8A5A00` | `#E6B65C` | 해석 한계, 진행 중 상태 |
| `--color-caution-soft` | `#FBF1DC` | `#3A2E14` | 위 바탕 |

다크 모드는 `prefers-color-scheme`을 따르고 `data-theme="light" | "dark"`로 강제 가능. 본문과 muted 텍스트는 두 모드 모두 WCAG AA(4.5:1) 이상.

### Typography

Pretendard Variable, 대체 Apple SD Gothic Neo, Malgun Gothic, system-ui. 숫자는 `tnum`으로 자리 맞춤. 한글 줄바꿈은 `word-break: keep-all`.

| Token | 크기 | 용도 |
| --- | --- | --- |
| `--text-xs` | 13px | 측정 조건, 라벨, 출처 |
| `--text-sm` | 15px | 표, 보조 설명, 메뉴 |
| `--text-md` | 17px | 본문 |
| `--text-lg` | 20px | 사례 요약, 소제목 |
| `--text-xl` | 24–32px | 섹션 제목 |
| `--text-2xl` | 32–52px | 페이지 제목 |
| `--text-metric` | 28–40px | 변경 후 수치 |

### Spacing, layout

4px 기반 `--space-1`(4) ~ `--space-9`(96). 콘텐츠 최대 폭 `--width-content` 72rem, 읽기 폭 `--width-prose` 42rem, 좌우 여백 `--gutter` 16–40px.

### Border, motion

`--border-thin` 1px, `--border-strong` 2px. `--radius-sm` 4px, `--radius-md` 8px. 그림자 없음. `--duration-fast` 120ms, `--duration-base` 200ms.

## Components

| Component | Class | 용도 | 변형 |
| --- | --- | --- | --- |
| Skip link | `.skip-link` | 키보드 사용자의 본문 이동 | — |
| Site header | `.site-header`, `.site-nav` | 고정 상단 메뉴 | 현재 페이지 `aria-current="page"` |
| Eyebrow | `.eyebrow` | 섹션, 사례 번호 라벨 | — |
| Page hero | `.page-hero` | 페이지 첫 화면. 제목, 요약, 메타(`dl`) | `.page-hero__grid` 두 열(도식 포함) |
| Flow | `.flow`, `.flow__step` | 변경 경로 도식(위에서 아래 화살표) | `.flow__step--accent`, `.flow__branches` 두 갈래 |
| Section | `.section`, `.section__head` | 메인 페이지 구획 | — |
| Case row | `.case-list`, `.case-row` | 사례 목록. 번호, 본문, 수치 세 열 | 수치 대신 `note`나 `tag-list` 가능 |
| Metric | `.metric-list`, `.metric` | 전후 수치 | `.metric-list--inline` 가로 배치 |
| Note | `.note` | 측정 조건, 출처 | `--scope` 직접 담당, `--caution` 해석 한계와 진행 상태 |
| Data table | `.data-table` | 측정 비교표 | `.num` 오른쪽 정렬, `.is-result` 결과 강조 |
| Compare | `.compare` | 기존과 변경 두 열 | `.compare__col--after` |
| Chapter | `.chapter` | 사례 상세의 한 단계. 왼쪽 고정 제목, 오른쪽 본문 | — |
| Code flow | `.code-flow` | 텍스트 도식 | — |
| Timeline | `.timeline` | 회사별 경력 | — |
| Tag list | `.tag-list` | 기술, 도구 | — |
| Def grid | `.def-grid` | 기술 분류, 학력 | `.def-grid--single` |
| Pager | `.pager` | 사례 간 이동 | — |

### Metric

```html
<div class="metric">
  <dt>장비 1개 클릭당 CanvasNode render 호출</dt>
  <dd>
    <span class="metric__before">2,340회</span>
    <span class="metric__arrow" aria-hidden="true">→</span>
    <span class="visually-hidden">에서</span>
    <span class="metric__after">1회</span>
  </dd>
</div>
```

- 화살표는 스크린리더에서 숨기고 "에서"로 읽히게 처리. 결과적으로 "2,340회 에서 1회".
- 확인된 두 시점만 표시. 중간값, 추세선, 배율(“2,340배”) 표현 금지.

### Note

```html
<p class="note"><span class="note__label">측정 조건</span>…</p>
<p class="note note--scope"><span class="note__label">기여 구분</span>…</p>
<p class="note note--caution"><span class="note__label">해석 범위</span>…</p>
```

### States

| 요소 | Hover | Focus | Current |
| --- | --- | --- | --- |
| 링크 | `--color-accent` 글자 | 2px `--color-focus` outline, 3px offset | — |
| 메뉴 | `--color-text` 글자 | 동일 | 2px accent 밑줄 |
| Skip link | — | 화면 상단에 표시 | — |

## 문구 규칙

`career-research/CLAUDE.md`의 글쓰기 원칙을 따름.

- 문장 끝은 명사형. `구조 설계`, `API 연결`.
- 이름 옆 직무가 있으므로 소개에서 직무를 다시 선언하지 않음.
- 실제 코드와 화면의 이름 사용. 지어낸 용어, 비유, 의인화 금지.
- 가운데 점으로 명사를 길게 나열하지 않고 조사나 쉼표로 연결. 메타 정보의 구분자(`회사 · 기간`)는 예외.
- 원인, 증상, 변경 내용과 측정 조건 생략 금지. 근거가 `conflict`나 `claimed`인 수치는 싣지 않음.
- 공개 금지: 전화번호, 고객사명, 내부 도메인, 이슈와 커밋 번호, 제품 화면.

## 새 사례 추가

1. `work/<slug>.html`을 기존 사례 파일에서 복사.
2. `page-hero`에 역할, 기간, 기술 메타 작성.
3. 문제 → 구조 판단 → 변경 → 측정 → 남은 과제 순서로 `chapter` 구성.
4. 수치가 있는 chapter에는 `note`로 측정 조건, 기여 범위 작성.
5. `index.html`의 `case-list`에 행 추가, 각 사례 헤더 메뉴와 `pager` 갱신.
