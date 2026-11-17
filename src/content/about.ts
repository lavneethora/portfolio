/** Hero intro, bio and awards. */

export const intro =
  "I'm a computer science student at Texas Tech and I like building things people end up using. My Chrome extension has 800+ users at Texas Tech, Nudge texts people before a free trial charges them, and Harvey and Databricks have merged my pull requests.";

export const bio = [
  "I study computer science at Texas Tech (Honors, with minors in math and bioengineering) and graduate in May 2027.",
  "Most of what I build starts with something that annoyed me: forgetting to cancel a free trial, switching tabs during registration, Instagram tagging my own photos as AI.",
  "Outside of projects I'm an officer in Google Developers Group at Texas Tech, and I led hacker experience for HackWesTX.",
];

export interface Award {
  name: string;
  detail?: string;
  href?: string;
}

export const awards: Award[] = [
  {
    name: "IEEE Computer Society Career Catalyst Scholar",
    detail: "One of 10 inaugural recipients.",
    href: "https://www.computer.org/publications/tech-news/insider-membership-news/2025-career-catalyst-recipients",
  },
  { name: "Gulf Coast Consortia Fellow" },
  { name: "President's Honor List", detail: "4 times, with a 3.94 GPA." },
  { name: "Hackathon Wins", detail: "HackCU12 (AMD Ryzen AI track) and HackWesTX VII (MLH track)." },
];
