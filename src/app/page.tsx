import Link from "next/link";
import { ViewTransition } from "react";
import { Eyebrow, MetricList, Note, TagList, buttonClass } from "@/components/ui";
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
              <span className={s.name}>
                {site.name} <span className={s.role}>Frontend Engineer</span>
              </span>
              <span className={s.headline}>
                편집 데이터의 변경과
                <br />
                저장 책임을 나누는 설계
              </span>
            </h1>
            <p className={s.lede}>
              2D 공정설계 에디터에서 편집 데이터와 Canvas 표현을 분리하고 좌표 계산, 저장, 실행 취소의 경로를 설계와 구현.
              현재 애자일소다 Frontend Lead.
            </p>
            <div className={s.cta}>
              <Link className={buttonClass("primary")} href="/#work">
                사례 보기
              </Link>
              <Link className={buttonClass()} href="/system/">
                디자인 시스템
              </Link>
            </div>
            <p className={s.tip}>
              에디터의 장비를 끌어 보거나 <kbd>⌘</kbd> <kbd>K</kbd>로 어디든 이동. 이 사이트의 조작은 모두 <kbd>⌘</kbd> <kbd>Z</kbd>로 되돌릴 수 있음.
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
            <p>각 사례에서 문제의 원인, 구조 판단과 직접 담당 범위, 측정 조건을 함께 기록. 팀원과 다른 직군의 작업은 사례마다 구분.</p>
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
                    <p className={s.workSummary}>{w.summary}</p>
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

      <section className={s.section} id="about-site" aria-labelledby="about-site-title">
        <div className="container">
          <header className={s.sectionHead}>
            <Eyebrow>This Site</Eyebrow>
            <h2 id="about-site-title">이 사이트도 하나의 사이드 프로젝트</h2>
            <p>보여 주는 페이지가 아니라 직접 설계한 구조를 만져 볼 수 있는 공간으로 구성.</p>
          </header>
          <ul className={s.siteFacts}>
            <li>
              <h3>모든 조작은 command</h3>
              <p>테마 변경과 첫 화면 에디터의 이동, 회전이 같은 history를 통과. <kbd>⌘Z</kbd>, <kbd>⇧⌘Z</kbd>로 사이트 전체 실행 취소.</p>
            </li>
            <li>
              <h3>토큰 하나에서 시작</h3>
              <p>
                <code>tokens.ts</code> 하나에서 CSS 변수와 <Link href="/system/">디자인 시스템 문서</Link>를 함께 생성. 색 대비는 빌드 시점에 계산.
              </p>
            </li>
            <li>
              <h3>정적 HTML과 필요한 곳만 JS</h3>
              <p>Next.js 16 정적 export로 모든 페이지를 HTML로 생성하고 GitHub Pages에 배포. 인터랙션이 있는 부분만 클라이언트 컴포넌트.</p>
            </li>
            <li>
              <h3>측정할 수 있는 기준</h3>
              <p>Lighthouse CI로 성능, 접근성, SEO 점수를 배포 전에 검사. 사례와 같은 방식으로 수치와 조건을 함께 기록.</p>
            </li>
          </ul>
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
            <dl className={s.defList}>
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
              <h2>공개 저장소</h2>
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
              <h2 id="contact-title">연락</h2>
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
