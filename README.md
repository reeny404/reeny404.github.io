# reeny404.github.io

이효현의 웹 포트폴리오이자 사이드 프로젝트. https://reeny404.github.io

Next.js 16 App Router 정적 export → GitHub Pages. 사이트의 조작은 모두 command로 기록되어 ⌘Z로 되돌릴 수 있음.

```
src/design/          tokens.ts(단일 원본), tokens-css.ts, contrast.ts
src/components/      ui(Metric, Note, DataTable…), case(Chapter…), site(Header…)
src/features/        command(history, ⌘K 팔레트, 토스트), editor(첫 화면 미니 에디터),
                     render-demo, theme, easter-eggs
src/content/         경력, 사례 요약 데이터
src/app/             페이지, sitemap, robots, og.png
scripts/             subset-font.mjs: 사이트에 쓰인 글자만 남긴 폰트 생성
docs/blog/           진행 기록 블로그 초안
```

```sh
npm install
npm run dev      # 폰트 subset 생성 후 개발 서버
npm run build    # out/ 정적 파일
npx @lhci/cli@0.15.1 autorun   # 성능 예산 검사 (lighthouserc.json)
```

`main` 푸시 시 GitHub Actions가 lint, build, Lighthouse CI를 통과한 경우에만 Pages에 배포. 디자인 규칙은 [DESIGN.md](DESIGN.md)와 사이트의 `/system` 페이지 참고. 경력 내용의 근거는 비공개 저장소 `career-research`에서 관리.
