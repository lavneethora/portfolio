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
  /**
   * A phrase inside `did` to pick out in red pen. It has to appear verbatim;
   * if it does not, the line renders plain rather than losing anything.
   */
  mark?: string;
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
    mark: "top 4 of 27 contributors",
    did: "I'm in their top 4 of 27 contributors, and most of what I fixed was the model registry. Seven models had no pricing metadata at all, which was crashing the dashboard and misreporting cost by 12x, and a few more had drifted out of date. I got Gemini 3.x runs working again by sending the temperature Google requires on both the agent and judge paths. I also stopped the grader scoring unreadable deliverables as if an agent had written them, so they come back as errors now instead of verdicts.",
  },
  {
    repo: "omnigent-ai/omnigent",
    name: "Omnigent",
    logo: "/logos/databricks.png",
    what: "Databricks' Open-Source Agent Harness",
    org: { text: "Databricks", href: "https://www.databricks.com" },
    mark: "top 60 of 309 contributors",
    did: "I'm in their top 60 of 309 contributors, and most of it was uploads. I added seven new formats for Claude Code and Codex, which took the limits to 50 MB a file and 200 MB a session, and fixed a composer that was refusing .tsv files the server already accepted, along with the one-directional parity test that let the two drift apart. I also closed a credential leak, where a repository URL with a token embedded in it was being saved into session labels and pod specs.",
  },
  {
    repo: "rajfirke/provena",
    name: "Provena",
    what: "Tamper-Evident Audit Trails for AI Agents",
    mark: "top 2 of 42 contributors",
    did: "I'm in their top 2 of 42 contributors, and most of it was the hash chain. Pooled Postgres connections were inheriting the server's time zone, so timestamps read back shifted and verify_chain failed on chains that were perfectly intact. Buffered writes were worse, since every record is hashed before the flush, so after one interleaved write everything after it chained off a hash the table did not hold. I measured that at 10 repairs out of 10 and got it down to 1. I also fixed a retriever returning a list of documents, which was recording every one of them as having no provenance at all.",
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
