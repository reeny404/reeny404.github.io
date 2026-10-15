import type { Metadata } from "next";
import { CaseBody, CaseHero, Chapter, ChapterTitle, Pager } from "@/components/case";
import { CodeFlow, Compare, DataTable, Note } from "@/components/ui";
import { caseStudies } from "@/content/cases";
import { RenderDemo } from "@/features/render-demo/RenderDemo";

const { title, description } = caseStudies.plotplan;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work/plotplan/" },
  openGraph: { type: "article", title, description, images: ["/og.png"], url: "/work/plotplan/" },
};

export default function PlotPlanPage() {
  return (
    <>
      <CaseHero
        slug="plotplan"
        eyebrow="Case 01 · 애자일소다"
        title={title}
        lede="수백 개 장비를 선택하고 이동, 회전한 뒤 저장하는 플랜트 공정설계 2D 에디터. 편집 데이터의 기준을 document store 하나로 두고 모든 변경을 command로 통과시키는 구조 설계, 재작성 후 같은 조건에서 다시 측정해 회귀를 원인별로 복구한 과정."
        meta={[
          ["역할", "Frontend Lead, V2 초기 구조 설계와 구현"],
          ["기간", "V1 유지보수 2025.12~ · V2 설계와 구현 2026.03~08 · 후속 개선 2026.09~"],
          ["기술", "React, TypeScript, Konva, Zustand, TanStack Query, MSW, Playwright"],
        ]}
      />
      <CaseBody>
        <Chapter id="problem" index="01 문제" title="진입점마다 달라지는 편집 동작">
          <p className="prose">
            기존 D3/SVG 에디터의 유지보수를 맡은 뒤 같은 종류의 회귀가 반복되는 것을 확인. 개별 함수의 버그보다 상태와 책임의 기준이 여러 곳에 흩어진 구조에 가까운 원인.
          </p>
          <ul className="prose">
            <li>좌표와 회전 계산이 화면 그리기, 패널, 저장 경로에 나뉘어 존재</li>
            <li>같은 동작도 진입점에 따라 서로 다른 좌표계 사용</li>
            <li>편집 상태와 서버 상태, 화면 단계의 기준이 한곳에 없음</li>
            <li>저장 경로 하나가 서로 다른 의미의 변경을 함께 처리해 단순 이동이 AI 배치 결과까지 무효화</li>
          </ul>
          <Note label="범위">V1 전체를 처음 만든 것은 아님. 기존 에디터의 유지보수와 반복 회귀를 맡은 뒤 V2 재설계 시작.</Note>
        </Chapter>

        <Chapter id="structure" index="02 구조" title="document store와 command">
          <ChapterTitle>편집 데이터는 document store, Canvas는 화면 표현</ChapterTitle>
          <p className="prose">
            D3를 Konva로 바꾸기 전에 편집 상태의 기준부터 결정. 서버에 저장되는 값과 편집 중인 document를 기준으로 두고 Konva node는 그 상태를 그린 결과로 취급. 이동, 회전, 생성, 삭제가 UI handler에서 상태를 직접 바꾸지 않도록 변경 진입점을 command로 제한하고, 실행 취소는 별도 기능 대신 command의 do/undo로 처리.
          </p>
          <CodeFlow label="편집 변경 경로">{`드래그 / 정렬바 / 좌표 패널
            ↓
      Command (do / undo)
            ↓
       Document Store
            ↓
        React / Konva`}</CodeFlow>
          <DataTable
            caption="상태별 기준 위치"
            columns={["상태", "기준"]}
            rows={[
              ["편집 document", "FE document store"],
              ["확정(confirm) 상태", "BE"],
              ["화면 단계", "BE status에서 파생"],
              ["미저장 변경 여부", "command, undo stack에서 판단"],
              ["Canvas node", "저장하지 않는 화면 표현"],
            ]}
          />
          <Note label="직접 담당" tone="scope">
            V2 초기 모듈, document store와 command 구조 설계와 구현. 이 구조를 바탕으로 팀원들이 label, 다중 뷰, 검증 기능 확장. 팀 개발 결과로 2026.08 고객 검증계 배포와 운영계 이관.
          </Note>
          <Note label="이 사이트에서">첫 화면의 미니 에디터가 같은 구조를 축소한 것. 드래그 중에는 화면 상태만 바뀌고, 놓는 순간 command 하나로 document에 반영.</Note>
        </Chapter>

        <Chapter id="coordinates" index="03 좌표" title="5곳에 분산된 이동, 회전 계산 통합">
          <p className="prose">
            드래그, 정렬바, 좌표 패널에서 각각 처리하던 구조물 이동과 회전 계산을 공통 command 계층으로 통합. 설계 공간 좌표를 계산의 기준으로 두고, 패널 입력을 화면 좌표로 바꿨다가 되돌리는 경로 축소. BE 담당자와 중복 계산 책임을 정리하고 장비 좌표를 FE에서 계산하도록 변경.
          </p>
          <Note label="판단 근거">
            계산을 UI handler마다 두면 설계 공간 좌표를 화면 좌표로 변환했다가 다시 되돌리는 경로가 생기고 반올림 오차 가능성 증가. 오차 발생률을 측정한 결과가 아닌 설계 이유.
          </Note>
        </Chapter>

        <Chapter id="save" index="04 저장" title="위치 변경과 구성 변경의 저장 경로 분리">
          <ChapterTitle>위치만 옮겨도 AI 결과가 무효화되는 문제 해결</ChapterTitle>
          <p className="prose">
            구조물의 구성 수정과 화면에서 위치만 옮기는 동작이 같은 저장 경로를 사용해, 장비 위치만 바꿔도 AI 배치 결과가 무효화되고 확정이 막히는 동작 확인. 구조물 내부 장비 좌표를 FE와 BE가 각각 계산해 특정 회전에서 서버 값이 FE 계산값을 덮어쓰는 버그도 함께 발생.
          </p>
          <Compare
            before={["구성 변경과 위치 변경이 같은 저장 경로 사용", "단순 이동에도 AI 결과 상태 변경", "FE와 BE에서 장비 좌표 중복 계산"]}
            after={["변경 종류에 따라 FE 저장 경로 분리", "변경 의미에 맞는 분리 API 호출", "FE에서 계산하고 BE는 전달된 값을 저장"]}
          />
          <Note label="기여 구분" tone="scope">
            FE 저장 경로 수정과 command 계층의 계산 통합, 계산 책임 정리가 본인 작업. BE API 분리와 서버의 중복 계산 제거는 BE 담당자의 작업.
          </Note>
        </Chapter>

        <Chapter id="render" index="05 측정" title="클릭 한 번에 2,340번의 render">
          <ChapterTitle>선택 구독 범위를 줄여 클릭당 render 호출 2,340회 → 1회</ChapterTitle>
          <p className="prose">
            장비 하나를 클릭해도 다른 노드까지 다시 렌더링되는 현상. Canvas draw 비용보다 React 쪽을 먼저 의심하고 render counter로 확인. 각 CanvasNode가 선택 배열 전체를 구독해 선택이 바뀔 때마다 새 배열 참조로 모든 노드가 다시 렌더링되고, CanvasNode에 memo도 없는 구조가 원인.
          </p>
          <RenderDemo />
          <CodeFlow label="구독 변경 전후">{`Before  CanvasNode → selectedItems[]
After   CanvasNode → isSelected: boolean
        전체 선택 집합이 필요한 drag start, bound 계산 → store.getState()`}</CodeFlow>
          <p className="prose">
            노드별 선택 여부(boolean) 구독과 memo 적용. 전체 선택 집합이 필요한 이벤트에서는 render 구독을 추가하지 않고 그 시점의 store 값 조회. 병목이 Canvas draw가 아니라 React rerender였으므로 Konva <code>cache()</code>, FastLayer, layer 분리는 적용하지 않음.
          </p>
          <DataTable
            caption="같은 V2 최적화 작업의 전후"
            columns={["지표", "수정 전", "수정 후"]}
            numeric={[1, 2]}
            rows={[
              ["장비 1개 클릭당 CanvasNode render 호출 합계", "2,340회", { value: "1회", result: true }],
              ["장비 768개 드래그 시작 최악 프레임", "191.7ms", { value: "83.4ms", result: true }],
              ["드래그 FPS 중앙값", "59.9", "59.9"],
            ]}
          />
          <Note label="측정 조건">장비 768개, CanvasNode 1,675개의 합성 mock. Chromium headless 1600×900, 2회 이상 측정 중앙값. render 수는 컴포넌트 카운터 합계.</Note>
          <Note label="해석 범위" tone="caution">
            개선 대상은 드래그를 시작하는 순간의 긴 프레임이며 평균 FPS는 동일. 별도 V1 측정의 같은 규모 최악 프레임 41.7ms보다는 여전히 긴 값. 768개는 부하 확인용 규모.
          </Note>
        </Chapter>

        <Chapter id="cls" index="06 회귀" title="다시 만든 에디터의 레이아웃 이동">
          <ChapterTitle>재작성 후 CLS 0.004 → 0.168 회귀를 앱 상태 기준으로 복구</ChapterTitle>
          <p className="prose">
            V2 배포 후 새 구조라서 좋아졌을 것이라고 결론내리지 않고 V1과 같은 mock, 같은 화면 조건에서 다시 비교. 첫 로드에서 본문 전체가 크게 이동하는 회귀 발견.
          </p>
          <p className="prose">
            처음에는 Canvas 컨테이너가 크기를 잡기 전에 그려지는 문제로 가정했으나, 부트스트랩 순서만 조정하자 CLS가 0.145 → 0.288로 오히려 악화. 실제 원인은 레이아웃 모드가 늦게 mount되는 DOM node와 <code>:has()</code> 조건에 의존하는 구조. 일반 레이아웃으로 그려진 뒤 특정 패널이 나타나면서 overlay 레이아웃으로 바뀌는 흐름. 메뉴 확정 여부와 앱 상태로 레이아웃을 먼저 결정하고, 부트스트랩부터 Canvas 로딩까지 같은 모드를 유지하도록 수정.
          </p>
          <DataTable
            caption="초기 레이아웃 안정성"
            columns={["지표", "V1", "초기 V2", "수정 V2"]}
            numeric={[1, 2, 3]}
            rows={[
              ["CLS", "0.004", "0.168", { value: "0.003", result: true }],
              ["Lighthouse 성능 점수", "68", "61", { value: "68", result: true }],
            ]}
          />
          <Note label="측정 조건">mock 서버, 장비 96개 장면, Lighthouse desktop 3회 중앙값(2026.09).</Note>
          <Note label="해석 범위" tone="caution">
            CLS와 점수를 재작성 이전 수준으로 회복한 결과이며 V1보다 빨라졌다는 의미는 아님. Main Thread와 JS 실행 시간은 V1보다 긴 상태로 기록.
          </Note>
        </Chapter>

        <Chapter id="cleanup" index="07 정리" title="V1 코드 제거와 숨은 버그">
          <p className="prose">
            V2 전환 후에도 남아 있던 D3 기반 V1 Canvas 코드 117개 파일 제거. V1 store가 V2에서 항상 빈 값이라 저장하지 않은 변경이 있어도 이탈 확인 창이 뜨지 않던 버그를 V2의 미저장 상태 판단으로 교체.
          </p>
          <p className="prose">
            타입 정리 중 저장 payload가 바뀌는 수정은 BE 확인 후 별도 작업으로 분리. 리팩터링과 동작 변경을 섞으면 회귀 원인을 좁히기 어렵다는 판단.
          </p>
        </Chapter>

        <Chapter id="drawing-recognition" index="08 도면 인식" title="BE 계약 확정 전 선개발">
          <ChapterTitle>요청, 응답과 진행률 계약을 FE에서 먼저 제안</ChapterTitle>
          <p className="prose">
            도면 인식 API가 정해지지 않은 상태에서 화면에 필요한 요청, 응답과 WebSocket 진행률 형태를 FE에서 먼저 제안. 같은 형태의 MSW mock으로 파일 업로드, 진행 상태, 인식 결과의 캔버스 반영까지 선개발. 인식 좌표와 사용자 배치 좌표를 어느 계층에서 갱신할지 BE, AI 담당자와 정리.
          </p>
          <CodeFlow label="선개발 흐름">{`FE 계약 제안 ─ MSW 응답 ─ mock WebSocket 진행률
                     ↓
            UI 개발과 상태 검증
                     ↓
          확정된 BE 계약으로 연결부 교체`}</CodeFlow>
          <Note label="진행 상태와 기여 구분" tone="caution">
            직접 담당 범위는 계약 제안, mock과 FE 흐름 구현, 좌표 갱신 책임 정리. AI 모델과 BE API 구현은 각 담당자의 작업. 2026.10 기준 확정 BE 계약 연결 진행.
          </Note>
        </Chapter>

        <Chapter id="lead" index="09 Frontend Lead" title="규칙을 검사 가능한 기준으로">
          <ChapterTitle>개발 규칙을 문서와 자동 검사에 함께 반영</ChapterTitle>
          <p className="prose">
            편집 데이터와 상태 변경, 저장 책임에 대한 팀 개발 규칙 문서화. ESLint에 코드와 의존성 규칙을 반영하고 MSW에서 정의하지 않은 요청을 차단하도록 설정. Playwright E2E 환경 도입. 반복해서 발견된 함정은 에디터 개발 가이드와 AI coding agent용 지침에 기록.
          </p>
          <ChapterTitle>설계와 리뷰, 교육, 작업 배정</ChapterTitle>
          <p className="prose">
            본인을 포함한 FE 3인 팀의 설계와 코드 리뷰, 인턴 OJT와 평가, FE 채용 면접 담당. 기능명세와 설계 문서 작성을 교육 과정에 포함. 고객 피드백을 이슈로 구체화해 FE, AI, BE 작업으로 나누고 개발 주기와 우선순위에 따라 일정과 배포 조율.
          </p>
        </Chapter>

        <Chapter id="remaining" index="10 남은 과제" title="측정 시점의 한계">
          <p className="prose">2026.09 mock 측정 시점에 함께 기록한 후속 과제.</p>
          <ul className="prose">
            <li>768개 장면의 드래그 시작 최악 프레임 83.4ms, V1의 41.7ms보다 긴 값</li>
            <li>768개 장면의 메모리 사용량과 listener 증가</li>
            <li>다중 선택 정확도</li>
          </ul>
          <Note>이후 해결 여부는 이 문서의 범위 밖. 성능 수치는 해당 시점 mock 기반 동일 조건 비교이며 V2가 모든 지표에서 V1보다 낫다는 의미는 아님.</Note>
        </Chapter>

        <Pager
          prev={{ href: "/#work", label: "전체 사례", dir: "처음으로" }}
          next={{ href: "/work/chipnsoda/", label: "ChipNSoDA 실시간 작업 상태", dir: "다음 사례" }}
        />
      </CaseBody>
    </>
  );
}
