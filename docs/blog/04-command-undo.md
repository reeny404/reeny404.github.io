# 포트폴리오를 사이드 프로젝트로 다시 만들기 (4) 사이트 전체에 실행 취소 넣기

> 초안. `[다듬기]`는 본인 의견으로 채울 부분.

## 아이디어

PlotPlan 에디터 V2에서 가장 중요한 결정은 "모든 편집은 command를 통과한다"였다. 이 사이트에서도 같은 규칙을 적용하면, 설명을 읽기 전에 손으로 먼저 알 수 있지 않을까.

결과: 테마를 바꾸거나 첫 화면 에디터에서 장비를 옮긴 뒤 ⌘Z를 누르면 되돌아간다.

## 구조

```ts
type Command = { label: string; scope: "site" | "editor"; do(): void; undo(): void };

history.execute(command); // do 실행 후 past에 쌓음
history.undo();           // past의 마지막을 undo, future로 이동
history.redo();
```

- 상태 라이브러리 없이 `useSyncExternalStore`로 구독
- 테마 변경도 command: `setTheme(next)`가 이전 값을 기억하는 command를 만들어 실행
- 입력창에 포커스가 있을 때는 ⌘Z를 가로채지 않음 (텍스트 실행 취소와 충돌 방지)

## 미니 에디터: document와 view 분리

첫 화면 에디터는 PlotPlan 구조를 축소한 것.

- **document**: 장비의 x, y, rotation. command로만 바뀜
- **view**: 선택된 장비, 드래그 중 미리보기 오프셋. 저장하지 않는 화면 상태

드래그하는 동안에는 view의 미리보기 값만 바뀌고, 포인터를 놓는 순간 `move` command 하나가 document에 반영된다. 그래서 ⌘Z 한 번이 드래그 한 번을 되돌린다. 드래그 중 pointermove마다 command를 쌓았다면 실행 취소가 수십 번 필요했을 것.

장비 컴포넌트는 `useIsSelected(id)`로 **자기 선택 여부 boolean만** 구독. 다른 장비를 선택해도 다시 렌더링되지 않는다. (5)편의 render 데모와 같은 원칙.

키보드로도 쓸 수 있게 장비는 `role="button"`과 `tabIndex`를 갖고, 방향키 이동과 R 회전도 같은 command를 사용.

## ⌘K 명령 팔레트

- 네이티브 `<dialog>`의 `showModal()`로 포커스 가두기와 Esc 닫기를 브라우저에 맡김
- `role="combobox"` 입력 + `aria-activedescendant`로 선택 항목 전달
- 이동, 테마, 실행 취소, 외부 링크를 한곳에서

## 토스트: 타이머 상태 없이

되돌릴 때 "되돌림: 테마 다크 → 라이트" 토스트를 띄운다. 처음에는 `useEffect` + `setTimeout`으로 숨겼는데, React 19의 lint 규칙(effect 안의 setState)에 걸렸다. 표시 시간을 **CSS animation**으로 처리하고 기록마다 `key`를 바꿔 애니메이션을 다시 시작하도록 변경. hover나 포커스 중에는 `animation-play-state: paused`로 멈춤.

[다듬기] 직접 써 보면서 바꾼 부분.

## 다음 글

(5) render 데모를 만들다 같은 버그를 만든 이야기
