# Design System

원본은 `src/design/tokens.ts`. 빌드할 때 같은 객체에서 CSS 변수(`tokens-css.ts`, layout의 `<style>`)와 `/system` 문서 페이지가 만들어지므로, 값은 이 파일에서만 바꾼다. 색 견본과 WCAG 대비 비율, 글자 크기, 간격, 움직임은 사이트의 `/system`에서 실제로 렌더링된 상태로 확인.

## 원칙

1. 카드 반복 대신 여백과 구분선. 테두리 상자는 비교, 도식, 데모에만
2. 수치 옆에 조건. 전후 수치에는 같은 화면에 측정 조건과 해석 범위
3. 기여 범위 표시. 다른 사람의 작업은 `Note tone="scope"`, 한계와 진행 상태는 `tone="caution"`
4. 지연 없는 움직임. transform과 opacity만, 80–380ms. `prefers-reduced-motion`이면 토큰 단계에서 0ms
5. 실제 화면 대신 도식과 데모. 공개 저장소이므로 회사 제품 캡처를 쓰지 않음

## 규칙

- 컴포넌트 CSS는 semantic 토큰(`--color-text`, `--space-4` …)만 참조. hex, px 값을 직접 쓰지 않음 (도식의 SVG 좌표 제외)
- 그림자는 `--shadow-subtle | raised | float | overlay`, 겹침 순서는 `--layer-*`만 사용. 그림자는 미니 에디터처럼 바탕 위에 올려 둔 것과 떠 있는 것에만
- 버튼은 모두 `Button`. 아이콘 버튼은 `variant="ghost" size="sm" icon`, 켜고 끄는 버튼은 `aria-pressed`
- 테마: `<html data-theme>` 없음 = 시스템 설정, `light` | `dark` = 강제. 첫 paint 전 인라인 스크립트로 적용
- 상태를 바꾸는 사용자 조작은 `history.execute(command)`를 통과. 화면 전용 상태(hover, 드래그 미리보기)는 제외
- 구독은 그 값이 필요한 가장 작은 컴포넌트에서. 목록 항목은 자기 값만 구독
- 터치 영역 24px 이상, 포커스는 2px accent outline
- 스크롤해서 나타나는 블록은 `data-reveal`, 짧은 목록은 `data-reveal="children"`. 첫 화면에 이미 보이는 요소와 움직임 줄이기 설정에서는 재생하지 않음. JS로 움직이는 값은 `features/motion/motion.ts`의 `settle`, `reveal`

## 컴포넌트

| 컴포넌트 | 위치 | 용도 |
| --- | --- | --- |
| `Eyebrow` | `components/ui` | 섹션, 사례 번호 라벨 |
| `MetricList` | `components/ui` | 전후 수치. `inline` 가로 배치 |
| `Note` | `components/ui` | `default` 측정 조건, `scope` 기여 구분, `caution` 해석 한계 |
| `DataTable` | `components/ui` | 측정 비교표. `numeric` 열 오른쪽 정렬, `{ result: true }` 강조 |
| `Compare` | `components/ui` | 기존과 변경 두 열 |
| `Button`, `buttonClass` | `components/ui` | `default`, `primary`, `ghost` × `md`, `sm`, `icon`. `aria-pressed`로 켜진 상태 |
| `TagList`, `CodeFlow` | `components/ui` | 기술 목록, 텍스트 도식 |
| `CaseHero`, `Chapter`, `Pager` | `components/case` | 사례 상세 구성. 제목은 첫 화면과 `ViewTransition`으로 연결 |
| `CommandPalette`, `HistoryToast` | `features/command` | ⌘K, 실행 취소 알림 |
| `HeroHeadline`, `FormatToolbar` | `features/editor` | 첫 화면 제목. 인트로 뒤 직접 고쳐 쓰는 텍스트 상자와 선택 영역 위 서식 툴바 |
| `MiniEditor` | `features/editor` | 첫 화면 도형 편집 데모. 이동, 회전, 확대와 실행 취소 |
| `RenderDemo` | `features/render-demo` | 구독 범위에 따른 render 횟수 비교 데모 |
| `StaggerGrid` | `features/stagger-grid` | 누른 점부터 번지는 격자와 이징 비교 데모 |
| `ScrollReveal` | `features/motion` | `[data-reveal]`이 화면에 들어올 때 아래에서 떠오르게 함. layout에 한 번 |

## 문구

사례 본문은 문장 끝을 명사형으로, 직무 재선언 금지, 실제 코드와 화면의 이름 사용, 원인과 측정 조건 생략 금지, 근거가 충돌하거나 확인되지 않은 수치 제외. 공개하지 않는 것: 전화번호, 고객사명, 내부 도메인, 이슈와 커밋 번호, 회사 제품 화면.

## 새 사례 추가

1. `src/content/cases.ts`의 `caseStudies`, `selectedWork`에 항목 추가
2. `src/app/work/<slug>/page.tsx`를 기존 사례에서 복사해 `CaseHero`와 `Chapter`로 구성 (문제 → 구조 판단 → 변경 → 측정 → 남은 과제)
3. `sitemap.ts`, `CommandPalette`의 이동 항목, 이웃 사례의 `Pager`, `public/llms.txt` 갱신
