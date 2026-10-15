import Link from "next/link";
import { site } from "@/content/profile";
import { PaletteButton, SiteNav, ThemeToggle } from "./SiteControls";
import s from "./site.module.css";

export function SiteHeader() {
  return (
    <header className={`${s.header} no-print`}>
      <div className={`container ${s.headerInner}`}>
        <Link className={s.logo} href="/">
          <span className={s.logoMark} aria-hidden="true" />
          {site.name}
        </Link>
        <SiteNav />
        <div className={s.controls}>
          <PaletteButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.footerInner}`}>
        <p>
          © 2026 {site.name}. Next.js 정적 export로 만들고 GitHub Pages에 배포.{" "}
          <a href={site.repo}>소스 코드</a>
        </p>
        <ul>
          <li>
            <a href={`mailto:${site.email}`}>Email</a>
          </li>
          <li>
            <a href={site.github}>GitHub</a>
          </li>
          <li>
            <a href={site.blog}>Blog</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
