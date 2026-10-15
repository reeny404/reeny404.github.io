import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { site } from "@/content/profile";
import { tokensCss } from "@/design/tokens-css";
import { CommandPalette } from "@/features/command/CommandPalette";
import { HistoryToast } from "@/features/command/HistoryToast";
import { ConsoleGreeting } from "@/features/easter-eggs/ConsoleGreeting";
import { themeInitScript } from "@/features/theme/theme";
import "./globals.css";

// scripts/subset-font.mjs가 사이트에 쓰인 글자만 남겨 만든 파일. 없는 글자는 다음 서체로 대체
const pretendard = localFont({
  src: "./fonts/pretendard-subset.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-pretendard",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: `${site.name} 포트폴리오`,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: ["이효현", "Lee Hyohyeon", "Frontend Engineer", "프론트엔드", "Frontend Lead", "React", "TypeScript", "Konva", "에디터", "포트폴리오"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: `${site.name} 포트폴리오`,
    title: site.title,
    description: site.headline,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} | ${site.headline}` }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.headline, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        {/* 저장된 테마를 첫 paint 전에 적용해 깜빡임 방지 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* tokens.ts에서 만든 CSS 변수. 외부 CSS 요청 없이 첫 HTML에 포함 */}
        <style dangerouslySetInnerHTML={{ __html: tokensCss }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CommandPalette />
        <HistoryToast />
        <ConsoleGreeting />
      </body>
    </html>
  );
}
