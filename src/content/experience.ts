/** Jobs and research, newest first. Text follows the resume. */

export interface Role {
  org: string;
  title: string;
  when: string;
  where: string;
  did: string;
  /** Square logo in /public/logos, shown beside the organisation. */
  logo?: string;
}

export const roles: Role[] = [
  {
    org: "UTHealth Houston, BIG-TCR Program",
    logo: "/logos/uthealth.png",
    title: "Software Engineering Intern, Research",
    when: "Jun to Aug 2026",
    where: "Houston, TX",
    did: "Built an R/Seurat pipeline that scores neural-pathway activity in 900,000+ cells across 7 cancer datasets, then mapped that activity onto tumor tissue in 3 spatial datasets.",
  },
  {
    org: "Texas Tech, Electrical and Computer Engineering",
    logo: "/logos/texas-tech.png",
    title: "Undergraduate Research Assistant",
    when: "May to Oct 2025",
    where: "Lubbock, TX",
    did: "Measured movement patterns from actigraphy data in MATLAB. Ran the analysis on 1,887 patients in batches of 24-hour segments, which came out to 7,540 Hurst values.",
  },
  {
    org: "iMocha",
    logo: "/logos/imocha.png",
    title: "Software Engineering Intern, GenAI",
    when: "Jul to Aug 2025",
    where: "Remote",
    did: "Built a Python and n8n pipeline on the Gemini API that turns candidate feedback into QA reports. Triage went from 12 minutes a report to 3.",
  },
];
