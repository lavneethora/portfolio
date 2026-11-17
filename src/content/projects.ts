/**
 * The five featured projects, in page order.
 *
 * Edit the text here and the page follows. Every number below traces to the
 * resume, a README, or a public listing. If you change one, change its source.
 */

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Fact {
  /** The number or short claim that gets the red pen. */
  value: string;
  /** What the number is. */
  label: string;
  /** Where a reader can check it. */
  href?: string;
  /** Circle it in red pen. Use for one measured number per project at most. */
  pen?: boolean;
}

export interface Project {
  slug: string;
  name: string;
  /** One sentence: what it is. */
  line: string;
  /** Why it exists and what it does. */
  about: string;
  /** The part that was actually difficult. */
  hard: string;
  facts: Fact[];
  stack: string;
  links: ProjectLink[];
  /** A screenshot in /public/work, or "diagram" for the drawn one. */
  image: { src: string; alt: string; width: number; height: number } | "diagram";
}

export const projects: Project[] = [
  {
    slug: "nudge",
    name: "Nudge",
    line: "Texts you a few days before a free trial turns into a charge.",
    about:
      "I made Nudge because I kept forgetting to cancel free trials, and I didn't want another app to check. You sign up with a phone number, connect Gmail, and everything after that happens over text.",
    hard:
      "The hard part was deciding how much to trust the model. Anyone can email a user, so an email body is basically attacker-controlled, and a cancel link pulled out of one gets texted to the user as if it was safe. So nothing Claude extracts goes out until the link, the vendor name and the amount have been checked.",
    facts: [
      { value: "98", label: "services with a cancel link on file" },
      { value: "Live", label: "at nudgeme.app, with Google OAuth verification in progress" },
    ],
    stack: "TypeScript, Next.js, Gmail API, Claude API, Telnyx",
    links: [
      { label: "nudgeme.app", href: "https://nudgeme.app" },
      { label: "Code", href: "https://github.com/lavneethora/nudge" },
    ],
    image: {
      src: "/work/nudge.jpg",
      alt: "The Nudge signup page: the line 'Never get charged for a trial you forgot' above a phone number field.",
      width: 1440,
      height: 900,
    },
  },
  {
    slug: "ceremoni",
    name: "Ceremoni",
    line: "Gets every graduate's name pronounced right at the ceremony.",
    about:
      "Students record their own name once. Ceremoni pulls the phonetics out of the recording with GPT-Audio and voices it with Azure TTS, so the name read at the ceremony is the one the student said.",
    hard:
      "One pass through a model got names wrong too often. Now each recording is read 3 times across 2 audio models and the most common answer wins. I reshaped the MVP around what Texas Tech's Honors College needs for its Fall 2026 medallion ceremony.",
    facts: [
      { value: "3 readings", label: "of each recording, across 2 audio models" },
      { value: "Fall 2026", label: "Honors College medallion ceremony" },
    ],
    stack: "Python, FastAPI, PostgreSQL, GPT-Audio, Azure TTS, Docker",
    links: [{ label: "Code", href: "https://github.com/lavneethora/ceremoni" }],
    image: "diagram",
  },
  {
    slug: "raiderrating",
    name: "RaiderRating",
    line: "Professor ratings and grade distributions inside Texas Tech's schedule builder.",
    about:
      "Registration at Tech used to mean the schedule builder in one tab and Rate My Professors in another. RaiderRating puts the rating next to each professor's name, with the A to F breakdown for that exact professor and course one click away.",
    hard:
      "The grade data wasn't sitting behind an API I could call, so I scraped 5,000+ grade records with Playwright and serve them from an Express API with an in-memory cache. Name matching was the other problem. Two instructors who shared a last name used to get each other's ratings.",
    facts: [
      { value: "800+", pen: true, label: "users so far" },
      {
        value: "5.0 stars",
        label: "on the Chrome Web Store",
        href: "https://chromewebstore.google.com/detail/raiderrating/mfkadoinfgjghmfooigphelfpdicdfek",
      },
      { value: "5,000+", label: "grade records scraped and served" },
    ],
    stack: "TypeScript, React, Plasmo, Express, Playwright",
    links: [
      {
        label: "Chrome Web Store",
        href: "https://chromewebstore.google.com/detail/raiderrating/mfkadoinfgjghmfooigphelfpdicdfek",
      },
      { label: "Code", href: "https://github.com/lavneethora/RaiderRating" },
    ],
    image: {
      src: "/work/raiderrating.jpg",
      alt: "RaiderRating's store listing: a rating card with difficulty, would-take-again and a grade distribution, next to a course list in the schedule builder.",
      width: 1192,
      height: 748,
    },
  },
  {
    slug: "findmyspot",
    name: "FindMySpot",
    line: "Turns one fixed parking camera into a live map of open stalls.",
    about:
      "Built with a teammate over one weekend at HackWesTX VII, where it won MLH's Best Use of .Tech. I wrote the Python side: detection, stall state, and routes that follow the real driving lanes.",
    hard:
      "A weekend is not enough time to train a detector, so we didn't. A COCO-pretrained YOLO11m with no fine-tuning scored 96.0% over 150 frames of the PKLot benchmark, which was good enough to spend the remaining hours on the map and the routing.",
    facts: [
      { value: "96.0%", pen: true, label: "on 150 PKLot benchmark frames, with no fine-tuning" },
      { value: "Won", label: "MLH Best Use of .Tech at HackWesTX VII" },
    ],
    stack: "Python, YOLO11, WebSockets, TimescaleDB, TypeScript",
    links: [
      { label: "findmyspot.tech", href: "https://findmyspot.tech" },
      { label: "Code", href: "https://github.com/lavneethora/FindMySpot" },
    ],
    image: {
      src: "/work/findmyspot.jpg",
      alt: "The FindMySpot dashboard: 46 stalls available, 54 occupied, and a numbered lot layout with the closest free stall marked.",
      width: 1440,
      height: 900,
    },
  },
  {
    slug: "three-body",
    name: "Three Body",
    line: "A 3D gravity simulator that runs in the browser.",
    about:
      "I started this after watching 3 Body Problem. You place stars and planets, pick real ones or invent your own, and watch whether the orbits hold. The orbit at the top of this page runs on the same integrator.",
    hard:
      "I cared more about the physics being right than about how it looked. The figure-eight orbit returns to its start with a period that matches the published value to 0.0000%. The black hole is ray traced per pixel, which is where the shadow and the bent disk come from.",
    facts: [
      { value: "0.0000%", pen: true, label: "off the published figure-eight period" },
      { value: "Per pixel", label: "ray tracing for the black hole" },
    ],
    stack: "TypeScript, Next.js, three.js, GLSL",
    links: [
      { label: "Run the simulator", href: "https://threebody-sim.vercel.app" },
      { label: "Code", href: "https://github.com/lavneethora/three-body" },
    ],
    image: {
      src: "/work/three-body-black-hole.jpg",
      alt: "A ray-traced black hole in the simulator, seen nearly edge on, its glowing disk bent up and over the shadow.",
      width: 1180,
      height: 718,
    },
  },
];
