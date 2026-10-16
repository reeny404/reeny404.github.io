/**
 * 첫 paint 전에 실행되는 인라인 스크립트. 홈을 새로 불러왔고 모션을 줄이지 않았다면
 * <html data-hero-intro="pending">으로 제목을 숨겨, hydration 전에 완성된 문구가 먼저 보이지 않게 함.
 * 다른 페이지에서 클라이언트 이동으로 돌아올 때는 실행되지 않아 인트로 없이 완성 상태로 보임
 */
export const heroIntroInitScript = `(function(){try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.heroIntro="pending"}catch(e){}})()`;
