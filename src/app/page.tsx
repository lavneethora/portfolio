import Image from "next/image";
import { CeremoniDiagram } from "@/components/CeremoniDiagram";
import { Mark } from "@/components/Mark";
import { Orbit } from "@/components/Orbit";
import { PrState } from "@/components/PrState";
import { Taped } from "@/components/Taped";
import { askMeAbout, awards, bio, intro } from "@/content/about";
import { roles } from "@/content/experience";
import { githubShot, more, moreIntro } from "@/content/more";
import { fetchedAt, otherOpen, repoGroups, totalMerged } from "@/content/opensource";
import { projects, type Project } from "@/content/projects";
import { site } from "@/lib/site";

function ProjectEntry({ project, first }: { project: Project; first: boolean }) {
  return (
    <article className="project" id={project.slug}>
      <div>
        <h3 className="display">{project.name}</h3>
        <p className="line">{project.line}</p>

        <div className="prose">
          <p>{project.about}</p>
          <p>{project.hard}</p>
        </div>

        <ul className="facts">
          {project.facts.map((fact) => {
            const value = fact.pen ? <Mark>{fact.value}</Mark> : fact.value;
            return (
              <li key={fact.value}>
                <span className="value">
                  {fact.href ? <a href={fact.href}>{value}</a> : value}
                </span>
                <span>{fact.label}</span>
              </li>
            );
          })}
        </ul>

        <p className="meta">{project.stack}</p>
        <p className="links">
          {project.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </p>
      </div>

      <Taped>
        {project.image === "diagram" ? (
          <CeremoniDiagram />
        ) : (
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(min-width: 1100px) 44vw, 92vw"
            priority={first}
          />
        )}
      </Taped>
    </article>
  );
}

export default function Home() {
  return (
    <>
      <Orbit>
        <h1 className="name">
          <span className="first">Lavneet</span>
          <span className="last">Hora</span>
        </h1>
        <p className="hero-intro">{intro}</p>
      </Orbit>

      <main className="sheet">
        <section className="section" id="work" aria-labelledby="work-title">
          <h2 className="section-title" id="work-title">
            Work
          </h2>
          <div className="section-body">
            {projects.map((project, i) => (
              <ProjectEntry key={project.slug} project={project} first={i === 0} />
            ))}

            <article className="project" id="more">
              <div>
                <h3 className="display">More work</h3>
                <p className="line">{moreIntro}</p>
                <ul className="more-list">
                  {more.map((item) => (
                    <li key={item.name}>
                      <span className="name-cell">
                        {item.href ? <a href={item.href}>{item.name}</a> : item.name}
                        {item.note ? <span className="note">{item.note}</span> : null}
                      </span>
                      <p>{item.line}</p>
                    </li>
                  ))}
                </ul>
                <p className="links">
                  <a href={site.github}>Everything on GitHub</a>
                </p>
              </div>

              <Taped>
                <Image
                  src={githubShot.src}
                  alt={githubShot.alt}
                  width={githubShot.width}
                  height={githubShot.height}
                  sizes="(min-width: 1100px) 44vw, 92vw"
                />
              </Taped>
            </article>
          </div>
        </section>

        <section className="section" id="open-source" aria-labelledby="oss-title">
          <h2 className="section-title" id="oss-title">
            Open source
          </h2>
          <div className="section-body">
            <p className="section-lede">
              Since September 2026 I&apos;ve been sending fixes to open-source AI tooling.{" "}
              <Mark kind="underline">{totalMerged} pull requests</Mark> are merged so far. The
              list below comes straight from GitHub, last pulled on {fetchedAt}.
            </p>

            <ul className="rows">
              {repoGroups.map((group) => (
                <li key={group.repo}>
                  <div className="row-head">
                    <h3>
                      <a href={`https://github.com/${group.repo}`}>{group.name}</a>
                    </h3>
                    <span className="aside">
                      {group.merged > 0 ? (
                        <PrState state="merged">{group.merged} merged</PrState>
                      ) : null}
                      {group.open > 0 ? <PrState state="open">{group.open} open</PrState> : null}
                    </span>
                  </div>
                  <p className="quiet">{group.what}</p>
                  <p>{group.did}</p>
                  <details className="prs">
                    <summary>Show the pull requests</summary>
                    <ol>
                      {group.prs.map((pr) => (
                        <li key={pr.url}>
                          <PrState state={pr.state}>{pr.state}</PrState>
                          <a href={pr.url}>{pr.title}</a>
                        </li>
                      ))}
                    </ol>
                  </details>
                </li>
              ))}
              {otherOpen.length > 0 ? (
                <li>
                  <div className="row-head">
                    <h3>Also under review</h3>
                    <span className="aside">
                      <PrState state="open">{otherOpen.length} open</PrState>
                    </span>
                  </div>
                  <details className="prs">
                    <summary>Show the pull requests</summary>
                    <ol>
                      {otherOpen.map((pr) => (
                        <li key={pr.url}>
                          <PrState state={pr.state}>{pr.state}</PrState>
                          <a href={pr.url}>
                            {pr.repo.split("/")[1]}: {pr.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </details>
                </li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="section" id="experience" aria-labelledby="experience-title">
          <h2 className="section-title" id="experience-title">
            Experience
          </h2>
          <div className="section-body">
            <ul className="rows">
              {roles.map((role) => (
                <li key={role.org}>
                  <div className="row-head">
                    <h3>{role.org}</h3>
                    <span className="aside">
                      {role.when}, {role.where}
                    </span>
                  </div>
                  <p className="quiet">{role.title}</p>
                  <p>{role.did}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="about" aria-labelledby="about-title">
          <h2 className="section-title" id="about-title">
            About
          </h2>
          <div className="section-body about-grid">
            <div className="bio">
              {bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="grid gap-10">
              <div>
                <h3 className="subhead">Awards</h3>
                <ul className="plain-list">
                  {awards.map((award) => (
                    <li key={award.name}>
                      <strong>
                        {award.href ? <a href={award.href}>{award.name}</a> : award.name}
                      </strong>
                      {award.detail ? <span className="quiet"> {award.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="subhead">Ask me about</h3>
                <ul className="plain-list">
                  {askMeAbout.map((item) => (
                    <li key={item.topic}>
                      <strong>{item.topic}.</strong>
                      <span className="quiet"> {item.line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="contact" aria-labelledby="contact-title">
          <h2 className="section-title" id="contact-title">
            Contact
          </h2>
          <div className="section-body">
            <a className="contact-email display" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <ul className="contact-links">
              <li>
                <a href={site.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a href={site.github}>GitHub</a>
              </li>
              <li>
                <a href={site.resume}>Resume (PDF)</a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
