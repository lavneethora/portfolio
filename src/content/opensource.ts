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
  /** One line about what the fixes were. */
  did: string;
}

/** Listed in this order. Repos not named here are grouped at the end. */
const featured: RepoNote[] = [
  {
    repo: "harveyai/harvey-labs",
    name: "Harvey LAB",
    what: "Harvey's Legal Agent Benchmark",
    did: "The grader was scoring unreadable files as if an agent had written them, and 7 models with no pricing metadata were crashing the dashboard and misreporting cost by 12x.",
  },
  {
    repo: "omnigent-ai/omnigent",
    name: "Omnigent",
    what: "Databricks' open-source agent harness",
    did: "Patched a credential leak where repository URLs with embedded tokens were saved into session labels and pod specs.",
  },
  {
    repo: "rajfirke/provena",
    name: "Provena",
    what: "Tamper-evident audit trails for AI agents",
    did: "Mostly storage fixes, like pinning pooled Postgres connections to UTC so chain verification survives a non-UTC time zone.",
  },
  {
    repo: "sgl-project/sglang",
    name: "SGLang",
    what: "A serving framework for large language models",
    did: "Two fixes under review, one for tool-call parsing dropping text before a partial marker.",
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
