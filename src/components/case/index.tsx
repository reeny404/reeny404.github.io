import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import s from "./case.module.css";

export function CaseHero({
  slug,
  eyebrow,
  title,
  lede,
  meta,
}: {
  slug: string;
  eyebrow: string;
  title: string;
  lede: ReactNode;
  meta: [string, string][];
}) {
  return (
    <section className={s.hero} aria-labelledby="case-title">
      <div className="container">
        <Eyebrow>{eyebrow}</Eyebrow>
        <ViewTransition name={`case-${slug}`} share="case-title" default="none">
          <h1 id="case-title" className={s.title}>
            {title}
          </h1>
        </ViewTransition>
        <p className={s.lede}>{lede}</p>
        <dl className={s.meta}>
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function CaseBody({ children }: { children: ReactNode }) {
  return <div className={`container ${s.body}`}>{children}</div>;
}

export function Chapter({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={s.chapter} id={id} aria-labelledby={`${id}-title`}>
      <div className={s.aside}>
        <Eyebrow>{index}</Eyebrow>
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className={s.main}>{children}</div>
    </section>
  );
}

export function ChapterTitle({ children }: { children: ReactNode }) {
  return <h3 className={s.chapterTitle}>{children}</h3>;
}

export function Pager({ prev, next }: { prev: { href: string; label: string; dir: string }; next: { href: string; label: string; dir: string } }) {
  return (
    <nav className={`${s.pager} no-print`} aria-label="사례 이동">
      <Link href={prev.href}>
        <span className={s.pagerDir}>← {prev.dir}</span>
        <span className={s.pagerTitle}>{prev.label}</span>
      </Link>
      <Link href={next.href}>
        <span className={s.pagerDir}>{next.dir} →</span>
        <span className={s.pagerTitle}>{next.label}</span>
      </Link>
    </nav>
  );
}
