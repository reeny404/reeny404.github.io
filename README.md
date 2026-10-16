# reeny404.github.io

Next.js로 만든 포트폴리오 사이트입니다. GitHub Pages로 배포합니다.

**https://reeny404.github.io**

## 주요 기능

- **도형 에디터**: 첫 화면의 캔버스에서 도형을 드래그, 회전하고 실행 취소할 수 있습니다.
- **명령 팔레트**: `⌘K`로 페이지 이동, 테마 변경, 실행 취소를 실행합니다.
- **라이트 / 다크 테마**: 시스템 설정을 따르고, 직접 선택한 테마는 저장됩니다.
- **디자인 시스템 문서**: [`/system`](https://reeny404.github.io/system/) 페이지에서 토큰과 컴포넌트를 확인할 수 있습니다.

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router, 정적 export)
- React 19, TypeScript
- CSS Modules, 디자인 토큰 기반 CSS 변수
- GitHub Actions, GitHub Pages, Lighthouse CI

## 시작하기

Node.js 22 이상이 필요합니다.

```sh
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | `out/`에 정적 파일 생성 |
| `npm run start` | 빌드 결과를 로컬에서 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npx @lhci/cli@0.15.1 autorun` | Lighthouse 성능 예산 검사 (`lighthouserc.json`) |

`dev`와 `build` 전에는 사이트에 쓰인 글자만 남긴 폰트 파일이 자동으로 생성됩니다.

## 프로젝트 구조

```
src/
├── app/          페이지와 라우트
├── components/   공통 UI 컴포넌트
├── content/      사이트에 표시되는 데이터
├── design/       디자인 토큰
└── features/     에디터, 명령 팔레트, 테마 등 기능 단위 모듈
scripts/          빌드 보조 스크립트
docs/             개발 기록
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 lint, build, Lighthouse CI를 실행하고, 모두 통과하면 GitHub Pages에 배포합니다. 설정은 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)에 있습니다.

## 문서

- [DESIGN.md](DESIGN.md): 디자인 원칙과 규칙
- [docs/blog](docs/blog): 개발 기록
