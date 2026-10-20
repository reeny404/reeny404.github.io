import { spring } from "animejs";

/**
 * JS로 움직이는 곳의 공통 값. CSS 쪽은 tokens.ts의 --duration-*, --ease-*.
 * 디자인 원칙(80–380ms, transform과 opacity만)을 넘지 않는 범위.
 */

/** 한 번 살짝 넘쳤다가 자리 잡음. 메뉴 밑줄처럼 자리를 옮기는 요소 */
export const settle = () => spring({ bounce: 0.25, duration: 380 });

export const reveal = {
  duration: 380,
  /** 아래에서 떠오르는 거리(px) */
  rise: 14,
  /** 같이 들어온 요소 사이의 간격과, 기다림이 길어지지 않도록 그 합의 상한 */
  step: 50,
  maxDelay: 200,
} as const;

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
