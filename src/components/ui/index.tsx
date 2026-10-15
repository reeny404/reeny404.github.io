import type { ComponentProps, ReactNode } from "react";
import type { Metric as MetricData } from "@/content/cases";
import s from "./ui.module.css";

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

export function Eyebrow({ children, as: Tag = "span" }: { children: ReactNode; as?: "span" | "p" }) {
  return <Tag className={s.eyebrow}>{children}</Tag>;
}

export function MetricList({ items, inline }: { items: MetricData[]; inline?: boolean }) {
  return (
    <dl className={cx(s.metricList, inline && s.metricInline)}>
      {items.map((m) => (
        <div className={s.metric} key={m.label}>
          <dt>{m.label}</dt>
          <dd>
            <span className={s.before}>{m.before}</span>
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
            <span className="visually-hidden">에서</span>
            <span className={s.after}>{m.after}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Note({
  label,
  tone = "default",
  children,
}: {
  label?: string;
  tone?: "default" | "scope" | "caution";
  children: ReactNode;
}) {
  return (
    <p className={cx(s.note, tone === "scope" && s.scope, tone === "caution" && s.caution)}>
      {label && <span className={s.noteLabel}>{label}</span>}
      {children}
    </p>
  );
}

export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul className={s.tagList} aria-label={label}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

type Cell = string | { value: string; result?: boolean };

export function DataTable({
  caption,
  columns,
  rows,
  numeric = [],
}: {
  caption: string;
  columns: string[];
  rows: Cell[][];
  /** 오른쪽 정렬할 열 인덱스 */
  numeric?: number[];
}) {
  return (
    <div className={s.tableWrap} role="region" aria-label={caption} tabIndex={0}>
      <table className={s.table}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th scope="col" key={c} className={cx(numeric.includes(i) && s.num)}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => {
                const { value, result } = typeof cell === "string" ? { value: cell, result: false } : cell;
                return (
                  <td key={i} className={cx(numeric.includes(i) && s.num, result && s.result)}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Compare({ before, after }: { before: string[]; after: string[] }) {
  return (
    <div className={s.compare}>
      <div className={s.compareCol}>
        <p className={s.compareLabel}>기존</p>
        <ul>
          {before.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
      <div className={cx(s.compareCol, s.compareAfter)}>
        <p className={s.compareLabel}>변경</p>
        <ul>
          {after.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CodeFlow({ label, children }: { label: string; children: string }) {
  return (
    <pre className={s.codeFlow} aria-label={label}>
      {children}
    </pre>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: "default" | "primary" | "ghost";
  size?: "md" | "sm";
  icon?: boolean;
};

export function Button({ variant = "default", size = "md", icon, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        s.button,
        variant === "primary" && s.primary,
        variant === "ghost" && s.ghost,
        size === "sm" && s.sm,
        icon && s.icon,
        className,
      )}
      {...rest}
    />
  );
}

export const buttonClass = (variant: "default" | "primary" | "ghost" = "default") =>
  cx(s.button, variant === "primary" && s.primary, variant === "ghost" && s.ghost);
