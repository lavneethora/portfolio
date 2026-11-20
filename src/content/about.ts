/** Hero intro, bio and awards. */

export const intro =
  "Hey! I'm Lavneet, a CS student at Texas Tech. I love building things, exploring new ideas, and turning them into something useful.";

export const bio = [
  "I'm studying Computer Science at Texas Tech University, graduating in May 2027, with minors in Math and Bioengineering.",
  "I love building cool things, especially when they solve problems I've faced or noticed around me.",
  "Outside of tech, I love watching soccer, F1, and football, and I'm always down to try something new or go on an adventure.",
];

export interface Award {
  name: string;
  detail?: string;
  href?: string;
}

export const awards: Award[] = [
  {
    name: "IEEE Computer Society Career Catalyst Scholar",
    href: "https://www.computer.org/publications/tech-news/insider-membership-news/2025-career-catalyst-recipients",
  },
  { name: "2026-27 Gulf Coast Consortia Single Cell & Spatial Omics (SCSO) Fellow" },
  { name: "4x President's Honor List" },
  {
    name: "2x Hackathon Winner",
    detail: "AMD Ryzen AI Track @ HackCU12 and MLH Track @ HackWesTX VII.",
  },
];
