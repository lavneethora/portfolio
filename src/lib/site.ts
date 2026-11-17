/**
 * Site-wide facts. Set NEXT_PUBLIC_SITE_URL to the real domain when
 * deploying so canonical links, the sitemap and link previews point at it.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const site = {
  name: "Lavneet Hora",
  title: "Lavneet Hora, software engineer",
  description:
    "CS student at Texas Tech who builds and ships software: Nudge, RaiderRating, FindMySpot, a 3D gravity simulator, and open source fixes merged at Harvey and Databricks.",
  email: "31lavneet@gmail.com",
  github: "https://github.com/lavneethora",
  linkedin: "https://www.linkedin.com/in/lavneethora",
  resume: "/resume.pdf",
  location: "Lubbock, Texas",
} as const;
