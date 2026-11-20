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
    did: "Built an R/Seurat pipeline that scores neural-pathway activity in 900,000+ cells across 7 cancer datasets, then linked that activity to immune infiltration and tumor burden. Extended it to 3 spatial tissue datasets, using RCTD cell-type deconvolution and custom image registration to map the activity onto the tumor tissue itself.",
  },
  {
    org: "Texas Tech, Electrical and Computer Engineering",
    logo: "/logos/texas-tech.png",
    title: "Undergraduate Research Assistant",
    when: "May to Oct 2025",
    where: "Lubbock, TX",
    did: "Quantified movement patterns across 17 mice by computing Hurst exponents (DFA) from actigraphy data in MATLAB, with a filtering step that handled missing data and found valid days across every subject at a 90% threshold. Ran the same analysis on 1,887 patients by batching 24-hour segments through MATLAB workers, which came out to 7,540 Hurst values.",
  },
  {
    org: "iMocha",
    logo: "/logos/imocha.png",
    title: "Software Engineering Intern, GenAI",
    when: "Jul to Aug 2025",
    where: "Remote",
    did: "Built an automated issue-resolution pipeline in Python and n8n on the Gemini API that summarizes candidate feedback, pulls out the issues and generates structured QA reports for 500+ monthly assessments. That cut triage from 12 minutes a report to 3, replacing manual review of 1,000+ feedback entries.",
  },
];
