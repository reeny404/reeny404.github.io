"use client";

import { useEffect, useState } from "react";
import { Eyebrow } from "@/components/ui";
import type { Heading } from "@/content/blog";
import s from "./blog.module.css";

/** 넓은 화면 오른쪽에 따라다니는 목차. 화면 위 1/3 선을 지난 마지막 제목을 지금 읽는 절로 표시 */
export function Toc({ items }: { items: Heading[] }) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const headings = items.map(({ id }) => document.getElementById(id)).filter((el) => el !== null);
    const update = () => {
      const line = window.innerHeight / 3;
      setActive(headings.filter((h) => h.getBoundingClientRect().top < line).at(-1)?.id);
    };
    // 제목이 위 1/3 선을 넘나들 때만 다시 계산
    const io = new IntersectionObserver(update, { rootMargin: "0px 0px -66% 0px" });
    headings.forEach((h) => io.observe(h));
    update();
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={s.toc} aria-label="목차">
      <Eyebrow as="p">Contents</Eyebrow>
      <ol>
        {items.map(({ id, text }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
