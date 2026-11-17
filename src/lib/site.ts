/**
 * Site-wide facts.
 *
 * The production domain is the default rather than an environment variable,
 * so a build is never quietly wrong about its own address. Preview and local
 * builds can still override it with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavneethora.me";

export const site = {
  name: "Lavneet Hora",
  title: "Lavneet Hora",
  description:
    "CS student at Texas Tech who builds and ships software: Nudge, RaiderRating, FindMySpot, a 3D gravity simulator, and open source fixes merged at Harvey and Databricks.",
  email: "31lavneet@gmail.com",
  github: "https://github.com/lavneethora",
  linkedin: "https://www.linkedin.com/in/lavneethora",
  resume: "/resume.pdf",
  location: "Lubbock, Texas",
} as const;
