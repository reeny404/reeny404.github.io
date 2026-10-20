"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

// 로컬 개발, Lighthouse CI(localhost)에서 쌓인 이벤트가 실제 방문 통계에 섞이지 않게 제외
const isLocalHost = (hostname: string) => hostname === "localhost" || hostname === "127.0.0.1";

/**
 * 방문자 수와 유입 경로(referrer, utm_*), 링크와 버튼 클릭 수집.
 * 키가 없거나 로컬이면 아무것도 불러오지 않고, Amplitude는 첫 화면이 그려진 뒤 idle 시점에 불러와 LCP에 영향 없게 함
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isLocalHost(window.location.hostname)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hostname은 브라우저에서만 알 수 있음
    setEnabled(true);

    if (!AMPLITUDE_API_KEY) return;
    const load = () =>
      import("@amplitude/analytics-browser").then((amplitude) =>
        amplitude.init(AMPLITUDE_API_KEY, {
          autocapture: {
            attribution: true, // referrer, utm_* 를 사용자 속성으로 기록
            pageViews: { trackHistoryChanges: "pathOnly" }, // 클라이언트 라우팅 이동도 페이지뷰로
            sessions: true,
            // 링크와 버튼 클릭만. 입력값 변경(Element Changed)과 화면 노출(zoning), 미니 에디터 같은 div 클릭은 제외
            // resolver가 있으면 기본 allowlist는 무시됨
            elementInteractions: {
              viewportContentUpdated: { enabled: false },
              shouldTrackEventResolver: (actionType, element) =>
                actionType === "click" && element.closest("a, button, [data-amp-default-track]") !== null,
            },
            formInteractions: false,
            fileDownloads: false,
          },
        }),
      );
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 2000);
    return () => clearTimeout(id);
  }, []);

  if (!enabled || !GA_ID) return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
