import Link from "next/link";
import { site } from "@/content/profile";
import { SiteNav, ThemeToggle } from "./SiteControls";
import s from "./site.module.css";

export function SiteHeader() {
  return (
    <header className={`${s.header} no-print`}>
      <div className={`container ${s.headerInner}`}>
        <Link className={s.logo} href="/">
          {site.name}
          <span className={s.logoRole}>Frontend Engineer</span>
        </Link>
        <SiteNav />
        <div className={s.controls}>
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
          <li>
            <a href={site.repo}>Source</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
