# Roadmap

## 1단계 (완료, 2026-10-15)

- Next.js 16 정적 export 전환, GitHub Actions(lint, build, Lighthouse CI, Pages 배포)
- tokens.ts 단일 원본, `/system` 페이지, 다크 모드와 View Transition 테마 전환
- 사이트 전역 command history와 ⌘Z, ⌘K 명령 팔레트, 토스트
- 첫 화면 미니 에디터, PlotPlan render 데모, 콘솔 인사
- SEO와 GEO: metadata, canonical, OG 이미지, sitemap, robots, JSON-LD ProfilePage, llms.txt
- 폰트 subset(2MB → 120KB), inline CSS. mobile Lighthouse 96~97, desktop 100

## 2단계 후보

- 나쁜 UX에서 좋은 UX로: 첫 진입에 일부러 레이아웃이 밀렸다가(CLS) 스스로 바로잡히는 장면. CLS 0.168 → 0.003 사례와 연결. 실제 CLS 점수에는 영향을 주지 않도록 사용자가 시작하는 방식으로
- 오프라인 미니 게임: Service Worker로 연결이 끊기면 장비를 피하는 게임. 404 페이지에서도 실행
- 사례 간 이동 shared element 전환 다듬기 (현재 제목 morph)
- 블로그 글을 사이트 `/blog`로 옮기고 티스토리에는 canonical 링크
- 배포 후 실제 GitHub Pages 환경에서 Lighthouse와 Search Console 확인
