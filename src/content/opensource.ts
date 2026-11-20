import data from "@/data/prs.json";

/**
 * Open source work. The pull requests themselves come from
 * src/data/prs.json (refresh with `npm run prs`). This file only adds a
 * plain description of each repository and decides the order.
 */

export interface PullRequest {
  repo: string;
  number: number;
  title: string;
  state: "merged" | "open";
  url: string;
  createdAt: string;
}

interface RepoNote {
  repo: string;
  /** The name people know it by. */
  name: string;
  /** What the project is, for someone who has not heard of it. */
  what: string;
  /**
   * The company named inside `what`, linked to its own site. The text has to
   * appear in `what` verbatim; if it does not, the line renders as plain
   * words rather than silently dropping anything.
   */
  org?: { text: string; href: string };
  /** One line about what the fixes were. */
  did: string;
  /** Square logo in /public/logos, shown beside the name. */
  logo?: string;
}

/**
 * The main list: repos where pull requests have actually merged, in this
 * order. Anything not named here (repos with only open pull requests, such
 * as SGLang) is grouped at the end under "Also under review".
 */
const featured: RepoNote[] = [
  {
    repo: "harveyai/harvey-labs",
    name: "Harvey LAB",
    logo: "/logos/harvey.png",
    what: "Harvey's Legal Agent Benchmark",
    org: { text: "Harvey", href: "https://www.harvey.ai" },
    did: "The grader was scoring unreadable files as if an agent had written them, and 7 models with no pricing metadata were crashing the dashboard and misreporting cost by 12x.",
  },
  {
    repo: "omnigent-ai/omnigent",
    name: "Omnigent",
    logo: "/logos/databricks.png",
    what: "Databricks' Open-Source Agent Harness",
    org: { text: "Databricks", href: "https://www.databricks.com" },
    did: "Patched a credential leak where repository URLs with embedded tokens were saved into session labels and pod specs.",
  },
  {
    repo: "rajfirke/provena",
    name: "Provena",
    what: "Tamper-Evident Audit Trails for AI Agents",
    did: "Mostly storage fixes, like pinning pooled Postgres connections to UTC so chain verification survives a non-UTC time zone.",
  },
];

export interface RepoGroup extends RepoNote {
  merged: number;
  open: number;
  prs: PullRequest[];
}

const all = data.prs as PullRequest[];

/** The day the snapshot was taken, written out, such as "November 17, 2026". */
export const fetchedAt: string = new Date(`${data.fetchedAt}T12:00:00Z`).toLocaleDateString(
  "en-US",
  { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
);

export const repoGroups: RepoGroup[] = featured.map((note) => {
  const prs = all.filter((pr) => pr.repo === note.repo);
  return {
    ...note,
    prs,
    merged: prs.filter((pr) => pr.state === "merged").length,
    open: prs.filter((pr) => pr.state === "open").length,
  };
});

/** Open pull requests in repos that are not featured above. */
export const otherOpen: PullRequest[] = all.filter(
  (pr) => !featured.some((note) => note.repo === pr.repo),
);

export const totalMerged = all.filter((pr) => pr.state === "merged").length;
