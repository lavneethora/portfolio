/**
 * Refreshes src/data/prs.json from the GitHub search API.
 *
 * Run with `npm run prs`. The output is committed, so the site builds
 * without a network call or a token, and the pull request counts on the
 * page are never typed by hand.
 */
import { writeFileSync } from "node:fs";

const AUTHOR = "lavneethora";

/** Tutorial repos whose whole point is a practice pull request. */
const PRACTICE_REPOS = new Set([
  "firstcontributions/first-contributions",
  "roshanjossey/code-contributions",
]);

interface SearchItem {
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  repository_url: string;
  pull_request?: { merged_at: string | null };
}

export interface PullRequest {
  repo: string;
  number: number;
  title: string;
  state: "merged" | "open";
  url: string;
  createdAt: string;
}

async function fetchPage(page: number): Promise<SearchItem[]> {
  const q = encodeURIComponent(`author:${AUTHOR} type:pr -user:${AUTHOR}`);
  const res = await fetch(
    `https://api.github.com/search/issues?q=${q}&per_page=100&page=${page}`,
    { headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-build" } },
  );
  if (!res.ok) throw new Error(`GitHub search failed: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { items: SearchItem[] };
  return body.items;
}

async function main() {
  const items: SearchItem[] = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await fetchPage(page);
    items.push(...batch);
    if (batch.length < 100) break;
  }

  const prs: PullRequest[] = [];
  for (const it of items) {
    const repo = it.repository_url.replace("https://api.github.com/repos/", "");
    if (PRACTICE_REPOS.has(repo.toLowerCase())) continue;
    const merged = Boolean(it.pull_request?.merged_at);
    // Closed without merging is neither shipped nor in flight, so it is left out.
    if (it.state === "closed" && !merged) continue;
    prs.push({
      repo,
      number: it.number,
      title: it.title,
      state: merged ? "merged" : "open",
      url: it.html_url,
      createdAt: it.created_at.slice(0, 10),
    });
  }

  prs.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number - a.number);

  const out = { fetchedAt: new Date().toISOString().slice(0, 10), prs };
  writeFileSync(
    new URL("../src/data/prs.json", import.meta.url),
    JSON.stringify(out, null, 2) + "\n",
  );

  const byRepo = new Map<string, { merged: number; open: number }>();
  for (const pr of prs) {
    const c = byRepo.get(pr.repo) ?? { merged: 0, open: 0 };
    c[pr.state]++;
    byRepo.set(pr.repo, c);
  }
  for (const [repo, c] of byRepo) console.log(`${repo}: ${c.merged} merged, ${c.open} open`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
