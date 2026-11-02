---
title: 같은 Claude Code를 쓰는데 왜 팀원마다 결과가 다를까
description: CLAUDE.md, wiki, command, lint로 AI 쓰는 법을 팀 자산으로
published: 2026-11-02
---

같은 Claude Code를 쓰는데 팀원마다 결과가 달랐다. 원인은 모델이 아니라 모델에게 주는 정보에 있었다. 각자 쓰는 `CLAUDE.md` 가 달랐고, 같은 내용을 매번 처음부터 다시 조사했고, 일을 시키는 방식도 사람마다 달랐다. 이 셋을 팀 공통으로 맞춰 온 이야기다.

## 처음에 불편했던 것

팀 플랜으로 모두 Claude를 쓰게 됐지만 결과물이 생각만큼 나오지 않았다. 같은 저장소인데 커밋 메시지 형식, 파일을 두는 위치, 화면 문구 언어가 사람마다 달랐다.

더 큰 문제는 배경지식이었다. 도메인 규칙, 브랜치 정책, 작업 범위를 아는 정도가 사람마다 달랐고, 그 차이가 그대로 Claude에게 넘어갔다. 결국 내가 매번 찾아가서 처음부터 설명해야 했다. 초반 이슈 댓글을 보면 "브랜치 정책은 문서에 적어 뒀는데 설명이 필요하면 말해 달라", "질문할 때 그렇게 판단한 근거도 같이 적어 달라" 같은 말이 계속 나온다.

그래서 목표를 하나로 잡았다. **내가 설명하지 않아도, 누가 시켜도 같은 결과가 나오게 하기.** 아래 1~3은 차이가 생기던 세 군데를 하나씩 맞춘 이야기고, 4는 맞춘 규칙을 실제로 지키게 만든 이야기다.

## 1. CLAUDE.md를 팀이 같이 쓰기

처음 `CLAUDE.md` 는 `.gitignore` 에 들어 있었다. 각자 자기 설정으로 쓰는 파일이었다. 그러다 보니 같은 저장소에서 세 사람의 AI가 서로 다른 규칙으로 코드를 썼다.

7월 말에 `.gitignore` 에서 빼고 팀이 같이 쓰는 파일로 바꿨다. 커밋 규칙, 브랜치 규칙, 새 코드를 어느 폴더에 둘지 같은 내용이 다 여기 들어 있다. 사람이 보는 규칙 문서를 따로 만들지 않고 이 파일 하나를 사람과 AI가 같이 본다.

팀원들은 오히려 반겼다. 같은 모델인데 왜 결과가 다르냐, 같이 일하는데 왜 코드가 제각각이냐는 불만은 다들 갖고 있었다. 개인 설정이 필요한 사람은 `CLAUDE.local.md` 에 따로 적는다.

## 2. 조사한 내용은 wiki에 남기기

AI는 대화가 끝나면 조사한 내용을 잊는다. 같은 걸 물을 때마다 코드를 처음부터 다시 뒤지고, 그러다 보니 사람마다 다른 결론이 나온다. 내가 매번 하던 설명도 결국 같은 문제였다. 그래서 한 번 조사하거나 설명한 건 wiki 페이지로 남긴다. 어디에 쓸지는 이 질문으로 정한다.

> 코드를 다 지우면 이 지식도 함께 사라지나?

- 사라진다면 코드 wiki: 지금 코드가 어떻게 생겼는지. 함정, 제약, 도메인 규칙
- 남는다면 결정 기록: 왜 그렇게 됐는지. 회의 결정, 열린 질문, 사고 기록

<figure>
<svg class="hand" viewBox="0 0 480 292" role="img" aria-labelledby="wiki-title" font-size="19">
<title id="wiki-title">코드를 다 지우면 이 지식도 사라지나? 사라진다면 코드 wiki(지금 코드가 어떻게 생겼는지), 남는다면 결정 기록(왜 그렇게 됐는지)</title>
<defs><filter id="sk-wiki" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
<g filter="url(#sk-wiki)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
<g class="c-soft"><rect x="30" y="12" width="420" height="52" rx="10" fill="currentColor"/><rect x="16" y="146" width="212" height="130" rx="10" fill="currentColor"/><rect x="252" y="146" width="212" height="130" rx="10" fill="currentColor"/></g>
<g class="c-ink"><rect x="30" y="12" width="420" height="52" rx="10" stroke="currentColor"/><rect x="16" y="146" width="212" height="130" rx="10" stroke="currentColor"/><rect x="252" y="146" width="212" height="130" rx="10" stroke="currentColor"/></g>
<g class="c-accent" stroke-width="2.2"><path d="M180 66Q150 100 122 140M132.7 134.6L122 140L123.5 128.1" stroke="currentColor"/><path d="M300 66Q330 100 358 140M347.3 134.6L358 140L356.5 128.1" stroke="currentColor"/></g>
</g>
<g class="c-ink" fill="currentColor" text-anchor="middle">
<text x="240" y="44" font-size="21" font-weight="700">코드를 다 지우면 이 지식도 사라지나?</text>
<text x="140" y="104" text-anchor="end">사라진다</text>
<text x="340" y="104" text-anchor="start">남는다</text>
<text x="122" y="182" font-size="23" font-weight="700">코드 wiki</text>
<text x="358" y="182" font-size="23" font-weight="700">결정 기록</text>
</g>
<g class="c-muted" fill="currentColor" text-anchor="middle">
<text x="122" y="214">지금 코드가 어떻게 생겼나</text>
<text x="122" y="240">함정, 제약, 도메인 규칙</text>
<text x="358" y="214">왜 그렇게 됐나</text>
<text x="358" y="240">회의 결정, 사고 기록</text>
</g>
</svg>
<figcaption>어디에 쓸지는 이 질문 하나로 정한다</figcaption>
</figure>

규칙도 두 개 정했다.

- grep 몇 초면 찾는 건 쓰지 않는다. 파일 목록이나 함수 시그니처는 코드를 보는 게 더 정확하다. 이유, 제약, 함정만 쓴다
- 결정은 AI가 확정하지 않는다. AI는 `proposed` 까지만 쓰고, `confirmed` 로 바꾸는 건 사람이 한다

## 3. 자주 시키는 일은 command로 만들기

같은 일을 시켜도 사람마다 시키는 말과 쓰는 용어가 달랐고, 빠뜨리는 단계도 달랐다. 그래서 자주 시키는 일은 slash command나 스킬로 만들어 두고, 직접 만들 필요가 없는 건 남이 만든 스킬을 찾아 쓴다. 저장소에 있는 command는 지금 14개다.

직접 만든 것 중에서는 이런 걸 자주 쓴다.

- 이슈 주소로 브랜치를 만들고 작업 시작
- 규약에 맞춘 커밋, MR 생성과 본문 갱신
- 회의 피드백 PPT에서 할 일을 뽑아 슬라이드 캡처와 함께 이슈로 일괄 등록
- 배포 전 테스트

남아 있는 세션 기록으로 세어 보니 MR command를 제일 많이 썼다. 내가 `/mr` 로 직접 입력한 게 51번, 말로 시켜서 Claude가 불러 쓴 게 87번이다. 다음은 커밋(32번), 이슈 등록(30번), 코드 리뷰(23번)였다.

배포 전 테스트 command는 두 개다. 먼저 release 코드를 로컬에 띄워 브라우저로 돌려 보는 command를 만들었고, 그걸 바탕으로 배포 서버에서 전체 흐름을 끝까지 돌리고 결과를 Slack으로 정리해 주는 command를 하나 더 만들었다. 둘 다 리팩토링할 때 많이 도움이 됐다. 리팩토링은 동작이 안 바뀌어야 하는데, 불안해서 전체 흐름을 자꾸 직접 돌려 보게 된다. 이제는 Claude가 돌린 결과를 보고 걸리는 부분만 더 보면 된다. 불안해서 쓰던 시간이 꽤 줄었다.

남이 만든 스킬 중에서는 작업 전에 질문부터 던져 주는 brainstorming, 원인 모를 버그를 하나씩 좁혀 가는 systematic-debugging, 한국어 문장에서 AI 말투를 걷어 내는 스킬을 자주 쓴다. 플러그인을 통째로 켜 두지 않고 필요한 스킬만 복사해서 쓴다.

MR을 올리기 전에는 규약 리뷰 에이전트가 늘 한 번 보고, 앱 코드가 바뀌었으면 코드 리뷰 에이전트도 따로 본다. 규약 리뷰는 lint가 못 잡는 것만 본다.

## 4. 꼭 지켜야 하는 건 lint로 막기

문서에 "화면 문구는 영어로 쓴다"고 적어 둬도 AI가 가끔 한글 문구를 넣었다. 그래서 꼭 지켜야 하는 규칙은 eslint 규칙으로 만들었다.

- 화면에 보이는 글자, `aria-label`, toast 문구에 한글이 있으면 lint 에러가 난다
- 폴더 구조를 FSD로 옮기는 중이라 레이어 규칙을 어기는 import를 lint로 막는다. 아직 남은 위반은 건수를 파일에 적어 두고, 늘어나면 에러가 난다
- wiki 문서는 커밋할 때 200줄 상한, 끊긴 링크, 필수 머리말을 자동으로 검사한다

문서로만 둔 규칙은 리뷰 때마다 다시 말해야 했다. lint로 옮기고 나서는 그런 말을 할 일이 없어졌다.

<figure>
<svg class="hand" viewBox="0 0 480 292" role="img" aria-labelledby="steps-title" font-size="18">
<title id="steps-title">규칙을 지키게 하는 힘의 계단. 문서(CLAUDE.md)는 대체로 지킴, command와 스킬은 절차를 매번 같게 반복, lint와 CI는 어기면 머지가 막힘</title>
<defs><filter id="sk-steps" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
<g filter="url(#sk-steps)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<g class="c-accent"><rect x="10" y="210" width="146" height="70" rx="6" fill="currentColor" fill-opacity="0.1"/><rect x="162" y="150" width="146" height="130" rx="6" fill="currentColor" fill-opacity="0.22"/><rect x="314" y="90" width="146" height="190" rx="6" fill="currentColor" fill-opacity="0.38"/></g>
<g class="c-ink" fill="none"><rect x="10" y="210" width="146" height="70" rx="6" stroke="currentColor"/><rect x="162" y="150" width="146" height="130" rx="6" stroke="currentColor"/><rect x="314" y="90" width="146" height="190" rx="6" stroke="currentColor"/></g>
<g class="c-accent" fill="none" stroke-width="2.2"><path d="M30 170L440 40M430.2 50L440 40L426.2 37.5" stroke="currentColor"/></g>
</g>
<g class="c-ink" fill="currentColor" text-anchor="middle" font-weight="700" font-size="22">
<text x="24" y="128" text-anchor="start" font-size="20" font-weight="700">지키게 하는 힘</text>
<text x="83" y="238">문서</text>
<text x="235" y="178">command, 스킬</text>
<text x="387" y="118">lint, CI</text>
</g>
<g class="c-ink" fill="currentColor" text-anchor="middle">
<text x="83" y="262">대체로 지킴</text>
<text x="235" y="202">절차를 매번</text>
<text x="235" y="220">같게 반복</text>
<text x="387" y="142">어기면</text>
<text x="387" y="160">머지가 막힘</text>
</g>
</svg>
<figcaption>규칙은 아래 계단에서 위 계단으로 옮길수록 잘 지켜진다</figcaption>
</figure>

## 실패한 것들

목표에 비춰 보면 실패는 두 종류였다. 차이를 줄이려고 만든 게 오히려 차이를 만들기도 했고, 결과는 그대로인데 손만 더 가게 만든 것도 있었다.

같은 내용을 보게 하려고 만든 wiki에서 사고가 세 번 났다.

- wiki를 다른 폴더에 복사해 두고 쓰다가 두 군데가 따로 고쳐져서 내용이 달라졌다. 그 뒤로 원본은 한 곳에만 두고, 나머지는 검색용으로만 쓴다
- wiki 도구가 제목으로 파일 이름을 만들 때 한글을 버렸다. `Plot 도메인 개요` 가 `plot.md` 가 되면서 링크가 다 끊겼다. 그래서 페이지 제목은 영어로 쓴다
- prettier가 wiki 머리말을 여러 줄로 바꿔 놓았다. wiki 검사 도구가 그걸 못 읽어서 페이지 7개가 어디에도 연결되지 않은 것으로 나왔다

만들어 놓고 결국 지운 것도 있다.

- wiki 변경 기록 파일. 브랜치마다 같은 파일 끝에 한 줄씩 붙이다 보니 거의 매번 충돌이 났다. 내용도 커밋 메시지와 똑같았다
- push 전 검사. MR CI에서 같은 검사를 또 돌리고 있었다. 지우면서 CI도 9분에서 5분 40초로 줄였다

AI 때문에 만든 것들도 결국 관리는 사람 몫이다. 아무도 안 보거나 다른 데서 이미 하고 있으면 지운다.

## 그래서 얼마나 달라졌나

효과를 딱 잘라 재기는 어렵다. 대신 Claude에게 커밋까지 맡긴 비율은 눈에 보인다. 공동 작성자 표시(`Co-Authored-By: Claude`)가 붙은 커밋을 월별로 셌다. 병합 커밋은 뺐다.

<div class="pair">

<figure>
<svg viewBox="0 0 480 262" role="img" aria-labelledby="commits-title" font-size="15">
<title id="commits-title">월별 전체 커밋과 Claude 공동 작성 커밋. 4월 0%, 5월 2%, 6월 7%, 7월 15%, 8월 42%, 9월 55%, 10월 96%. 10월 리팩토링 202건을 빼면 94%</title>
<g class="c-accent"><rect x="44" y="10" width="12" height="12" rx="3" fill="currentColor" fill-opacity="1"/></g><text class="c-ink" x="62" y="20" fill="currentColor" font-size="14">Claude 공동 작성</text>
<g class="c-accent"><rect x="198" y="10" width="12" height="12" rx="3" fill="currentColor" fill-opacity="0.45"/></g><text class="c-ink" x="216" y="20" fill="currentColor" font-size="14">리팩토링</text>
<g class="c-muted"><rect x="288" y="10" width="12" height="12" rx="3" fill="currentColor" fill-opacity="0.3"/></g><text class="c-ink" x="306" y="20" fill="currentColor" font-size="14">그 외 커밋</text>
<g class="c-line"><line x1="44" x2="470" y1="220" y2="220" stroke="currentColor"/></g><text class="c-muted" x="38" y="224" text-anchor="end" fill="currentColor" font-size="13">0</text>
<g class="c-line"><line x1="44" x2="470" y1="135" y2="135" stroke="currentColor"/></g><text class="c-muted" x="38" y="139" text-anchor="end" fill="currentColor" font-size="13">500</text>
<g class="c-line"><line x1="44" x2="470" y1="50" y2="50" stroke="currentColor"/></g><text class="c-muted" x="38" y="54" text-anchor="end" fill="currentColor" font-size="13">1000</text>
<g opacity="0.45"><title>4월: 전체 240, Claude 0 (0%)</title>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M59.4 220V183.2Q59.4 179.2 63.4 179.2H85.4Q89.4 179.2 89.4 183.2V220Z"/></g>
</g>
<text class="c-muted" x="74.4" y="238" text-anchor="middle" fill="currentColor">4월</text>
<text class="c-ink" x="74.4" y="171.2" text-anchor="middle" fill="currentColor" font-weight="600" opacity="0.45">0%</text>
<g opacity="0.45"><title>5월: 전체 88, Claude 2 (2%)</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M120.3 220V220.7Q120.3 220.7 120.3 220.7H150.3Q150.3 220.7 150.3 220.7V220Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M120.3 218.7V209Q120.3 205 124.3 205H146.3Q150.3 205 150.3 209V218.7Z"/></g>
</g>
<text class="c-muted" x="135.3" y="238" text-anchor="middle" fill="currentColor">5월</text>
<text class="c-ink" x="135.3" y="197" text-anchor="middle" fill="currentColor" font-weight="600" opacity="0.45">2%</text>
<g><title>6월: 전체 245, Claude 17 (7%)</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M181.1 220V218.1Q181.1 218.1 181.1 218.1H211.1Q211.1 218.1 211.1 218.1V220Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M181.1 216.1V182.4Q181.1 178.4 185.1 178.4H207.1Q211.1 178.4 211.1 182.4V216.1Z"/></g>
</g>
<text class="c-muted" x="196.1" y="238" text-anchor="middle" fill="currentColor">6월</text>
<text class="c-ink" x="196.1" y="170.4" text-anchor="middle" fill="currentColor" font-weight="600">7%</text>
<g><title>7월: 전체 239, Claude 36 (15%)</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M242 220V214.9Q242 214.9 242 214.9H272Q272 214.9 272 214.9V220Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M242 212.9V183.4Q242 179.4 246 179.4H268Q272 179.4 272 183.4V212.9Z"/></g>
</g>
<text class="c-muted" x="257" y="238" text-anchor="middle" fill="currentColor">7월</text>
<text class="c-ink" x="257" y="171.4" text-anchor="middle" fill="currentColor" font-weight="600">15%</text>
<g><title>8월: 전체 428, Claude 179 (42%)</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M302.9 220V190.6Q302.9 190.6 302.9 190.6H332.9Q332.9 190.6 332.9 190.6V220Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M302.9 188.6V151.2Q302.9 147.2 306.9 147.2H328.9Q332.9 147.2 332.9 151.2V188.6Z"/></g>
</g>
<text class="c-muted" x="317.9" y="238" text-anchor="middle" fill="currentColor">8월</text>
<text class="c-ink" x="317.9" y="139.2" text-anchor="middle" fill="currentColor" font-weight="600">42%</text>
<g><title>9월: 전체 486, Claude 269 (55%)</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M363.7 220V175.3Q363.7 175.3 363.7 175.3H393.7Q393.7 175.3 393.7 175.3V220Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M363.7 173.3V141.4Q363.7 137.4 367.7 137.4H389.7Q393.7 137.4 393.7 141.4V173.3Z"/></g>
</g>
<text class="c-muted" x="378.7" y="238" text-anchor="middle" fill="currentColor">9월</text>
<text class="c-ink" x="378.7" y="129.4" text-anchor="middle" fill="currentColor" font-weight="600">55%</text>
<g><title>10월: 전체 933, Claude 895 (96%), 그중 리팩토링 202</title>
<g class="c-accent"><path fill="currentColor" fill-opacity="1" d="M424.6 220V103.2Q424.6 103.2 424.6 103.2H454.6Q454.6 103.2 454.6 103.2V220Z"/></g>
<g class="c-accent"><path fill="currentColor" fill-opacity="0.45" d="M424.6 101.2V68.8Q424.6 68.8 424.6 68.8H454.6Q454.6 68.8 454.6 68.8V101.2Z"/></g>
<g class="c-muted"><path fill="currentColor" fill-opacity="0.3" d="M424.6 66.8V65.4Q424.6 61.4 428.6 61.4H450.6Q454.6 61.4 454.6 65.4V66.8Z"/></g>
</g>
<text class="c-muted" x="439.6" y="238" text-anchor="middle" fill="currentColor">10월</text>
<text class="c-ink" x="439.6" y="53.4" text-anchor="middle" fill="currentColor" font-weight="600">96%</text>
<text class="c-muted" x="418.6" y="90" text-anchor="end" fill="currentColor" font-size="13">리팩토링 202</text>
<g class="c-muted"><path d="M50 150.2V145.2H159.7V150.2" fill="none" stroke="currentColor"/></g><text class="c-muted" x="104.9" y="139.2" text-anchor="middle" fill="currentColor" font-size="14">세팅 시기</text>
</svg>
<figcaption>월별 커밋 수와 Claude 공동 작성 비율. 10월은 리팩토링을 빼도 94%</figcaption>
</figure>

| 월 | 전체 | Claude |
| --- | --- | --- |
| 4월 | 240 | 0 |
| 5월 | 88 | 2 |
| 6월 | 245 | 17 |
| 7월 | 239 | 36 |
| 8월 | 428 | 179 |
| 9월 | 486 | 269 |
| 10월 | 933 | 895 |
| 10월, 리팩토링 제외 | 731 | 693 |

</div>

4월과 5월은 기획과 디자인이 나오기 전이라 프로젝트를 세팅하던 때다. `CLAUDE.md` 를 팀이 같이 쓰기 시작한 7월 말 다음 달부터 Claude가 만든 커밋이 눈에 띄게 늘었다.

10월에 커밋이 933건으로 뛴 데는 두 가지가 겹쳤다. 하나는 FSD 이관이다. 옛 component 폴더가 남아 있는 한 이관이 끝나지 않아서, 시간이 남은 월말에 싹 옮겼다. 이관 브랜치에서 들어온 커밋이 202건이고 전부 Claude와 함께 만들었다. 옮긴 코드가 레이어 규칙을 어기면 lint가 바로 막아 줬다. 다른 하나는 문서다. 문서 커밋만 209건이었다. FSD 이관을 빼고 세도 10월은 731건 중 693건(94%)에 Claude가 들어갔다.

숫자를 볼 때 알아 둘 점도 있다. 이 표시는 Claude가 커밋을 만들 때만 붙어서, 내가 방향을 다 잡고 커밋만 맡긴 것도 똑같이 한 건이다. 또 같은 시기에 커밋을 잘게 나누는 규칙이 생겨서 커밋 수 자체도 늘었다.

## 마무리

처음 목표는 내가 설명하지 않아도 같은 결과가 나오게 하는 것이었다. 지금은 내가 하던 설명을 `CLAUDE.md` 와 wiki로 옮기는 중이고, 꼭 지켜야 하는 건 lint와 command로 막아 두었다.

좋은 습관은 평소 모습에서 드러난다고 생각한다. AI를 써 보니 AI도 우리 평소 모습을 그대로 따라 했다. 규칙이 사람마다 다르면 AI도 사람마다 다른 코드를 썼고, 규칙을 한곳에 모으니 비슷한 코드가 나오기 시작했다.

앞으로도 좋은 스킬이나 쓰는 법이 보이면 계속 들여 볼 생각이다. 언젠가는 AI 쓰는 방식이 어느 정도 정해진 틀로 자리 잡고, 우리 팀 방식도 다른 곳에서 그대로 가져다 쓸 수 있으면 좋겠다. 목표는 처음이나 지금이나 같은 모델로 같은 결과를 내는 것이다.
