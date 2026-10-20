<div align="center">

### 눈앞의 버그보다, 반복되는 이유를 봅니다

Frontend Engineer Portfolio

**[reeny404.github.io →](https://reeny404.github.io/?utm_source=github&utm_medium=repo_readme)**

</div>

<br />

## 사례

| 사례 | 내용 |
| --- | --- |
| [PlotPlan 에디터 V2](https://reeny404.github.io/work/plotplan/?utm_source=github&utm_medium=repo_readme) | 데이터, 화면, 저장의 책임을 나눠 다시 만든 에디터 |
| [ChipNSoDA 실시간 작업 상태](https://reeny404.github.io/work/chipnsoda/?utm_source=github&utm_medium=repo_readme) | REST 이력과 WebSocket 실시간 데이터를 하나의 화면 상태로 연결 |
| [미리캔버스 저장과 결제 안정화](https://reeny404.github.io/work/miridih/?utm_source=github&utm_medium=repo_readme) | 무한 로딩으로 나타나던 저장 실패 분석과 결제 상태의 DB 중심 전환 |

## 사이트에서 해볼 수 있는 것

- 첫 화면 제목을 클릭해 직접 고쳐 쓰기
- 옆 캔버스의 도형을 드래그하고 회전한 뒤 `⌘Z`로 되돌리기
- `⌘K`로 명령 팔레트를 열어 페이지 이동, 테마 변경
- [디자인 시스템](https://reeny404.github.io/system/?utm_source=github&utm_medium=repo_readme) 페이지에서 이 사이트의 색, 글자, 컴포넌트 보기

## 만든 방식

Next.js 정적 export와 GitHub Pages로 배포합니다. 색과 간격은 디자인 토큰 한 곳에서 관리하고, Lighthouse 성능, 접근성 검사를 통과해야 배포됩니다. 만드는 과정은 [개발 기록](docs/blog)에 남기고 있습니다.
