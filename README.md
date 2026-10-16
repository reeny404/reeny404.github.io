# reeny404.github.io

Personal portfolio site built as a side project. https://reeny404.github.io

Next.js 16 App Router 정적 export → GitHub Pages. 사이트의 상태 변경은 command로 기록되어 실행 취소와 다시 실행이 가능.

```
src/design/          tokens.ts(단일 원본), tokens-css.ts, contrast.ts
src/components/      ui(Metric, Note, DataTable…), case(Chapter…), site(Header…)
src/features/        command(history, 명령 팔레트, 토스트), editor(첫 화면 도형 에디터),
                     render-demo, theme, easter-eggs
src/content/         사례와 경력 데이터
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

`main` 푸시 시 GitHub Actions가 lint, build, Lighthouse CI를 통과한 경우에만 Pages에 배포. 디자인 규칙은 [DESIGN.md](DESIGN.md)와 사이트의 `/system` 페이지 참고.
