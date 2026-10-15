import Link from "next/link";
import { ViewTransition } from "react";
import { Eyebrow, MetricList, Note, TagList } from "@/components/ui";
import { selectedWork } from "@/content/cases";
import { education, experience, sideProjects, site, skills } from "@/content/profile";
import { MiniEditor } from "@/features/editor/MiniEditor";
import s from "./home.module.css";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: site.url,
  mainEntity: {
    "@type": "Person",
    name: site.name,
    alternateName: site.nameEn,
    jobTitle: "Frontend Engineer",
    description: site.description,
    email: `mailto:${site.email}`,
    url: site.url,
    sameAs: [site.github, site.blog],
    worksFor: { "@type": "Organization", name: "애자일소다", alternateName: "AgileSoDA" },
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school.split(" ")[0] })),
    knowsAbout: ["React", "TypeScript", "Konva", "Canvas", "WebSocket", "Design Systems", "Frontend Architecture"],
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

      <section className={s.hero} aria-labelledby="hero-title">
        <div className={`container ${s.heroGrid}`}>
          <div className={s.heroText}>
            <h1 id="hero-title">
              <span className={s.headline}>
                눈앞의 버그보다,
                <br />
                반복되는 이유를 봅니다
              </span>
            </h1>
            <p className={s.lede}>
              저장이 자꾸 실패하던 이유는 이벤트 로그에서, 다시 만든 에디터가 느려진 이유는 구독 범위에서 찾았습니다.
            </p>
          </div>
          <MiniEditor />
        </div>
      </section>

      <section className={s.section} id="work" aria-labelledby="work-title">
        <div className="container">
          <header className={s.sectionHead}>
            <Eyebrow>Selected Work</Eyebrow>
            <h2 id="work-title">직접 맡은 변경과 결과</h2>
            <p>각 사례에서 문제의 원인, 구조 판단과 직접 담당 범위, 측정 조건을 함께 기록했습니다.</p>
          </header>

          <ol className={s.workList}>
            {selectedWork.map((w) => {
              const href = `/work/${w.slug}/${w.anchor ? `#${w.anchor}` : ""}`;
              const title = <span className={s.workTitle}>{w.title}</span>;
              return (
                <li key={w.index} className={s.workRow}>
                  <span className={s.workIndex} aria-hidden="true">
                    {w.index}
                  </span>
                  <div className={s.workBody}>
                    <Link href={href} className={s.workLink}>
                      {w.anchor ? (
                        title
                      ) : (
                        <ViewTransition name={`case-${w.slug}`} share="case-title" default="none">
                          {title}
                        </ViewTransition>
                      )}
                      <span className={s.workArrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                    <span className={s.workContext}>{w.context}</span>
                    <h3>{w.headline}</h3>
                    <ul className={s.workPoints}>
                      {w.summary.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={s.workSide}>
                    {w.metrics && <MetricList items={w.metrics} />}
                    {w.tags && <TagList items={w.tags} label="사용 기술" />}
                    {w.note && (
                      <Note label={w.note.label} tone="caution">
                        {w.note.text}
                      </Note>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={s.section} id="experience" aria-labelledby="experience-title">
        <div className="container">
          <header className={s.sectionHead}>
            <Eyebrow>Experience</Eyebrow>
            <h2 id="experience-title">경력</h2>
          </header>
          <ol className={s.timeline}>
            {experience.map((job) => (
              <li key={job.company} className={s.timelineItem}>
                <div className={s.period}>
                  {job.periods.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </div>
                <div className={s.timelineBody}>
                  <div>
                    <h3>{job.company}</h3>
                    <p className={s.roleLine}>{job.role}</p>
                  </div>
                  <p>{job.summary}</p>
                  <ul>
                    {job.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  {"scope" in job && <Note label="기여 구분">{job.scope}</Note>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={s.section} id="skills" aria-labelledby="skills-title">
        <div className={`container ${s.split}`}>
          <div>
            <header className={s.sectionHead}>
              <Eyebrow>Skills</Eyebrow>
              <h2 id="skills-title">주요 기술</h2>
            </header>
            <dl className={s.skillRows}>
              {skills.map((g) => (
                <div key={g.group}>
                  <dt>{g.group}</dt>
                  <dd>
                    <TagList items={g.items} label={g.group} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <header className={s.sectionHead}>
              <Eyebrow>Side Projects</Eyebrow>
              <h2>사이드 프로젝트</h2>
            </header>
            <ul className={s.projects}>
              {sideProjects.map((p) => (
                <li key={p.name}>
                  <a href={p.href} className={s.projectLink}>
                    {p.name} <span aria-hidden="true">↗</span>
                  </a>
                  <span className={s.workContext}>{p.meta}</span>
                  <p className={s.workSummary}>{p.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={s.section} id="contact" aria-labelledby="contact-title">
        <div className={`container ${s.split}`}>
          <div>
            <header className={s.sectionHead}>
              <Eyebrow>Contact</Eyebrow>
              <h2 id="contact-title">연락처</h2>
            </header>
            <ul className={s.contact}>
              <li>
                <span>Email</span> <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <span>GitHub</span> <a href={site.github}>github.com/reeny404</a>
              </li>
              <li>
                <span>Blog</span> <a href={site.blog}>reeny404.tistory.com</a>
              </li>
            </ul>
          </div>
          <div>
            <header className={s.sectionHead}>
              <Eyebrow>Education</Eyebrow>
              <h2>학력</h2>
            </header>
            <dl className={s.defList}>
              {education.map((e) => (
                <div key={e.school}>
                  <dt>{e.school}</dt>
                  <dd className="muted">{e.period}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
