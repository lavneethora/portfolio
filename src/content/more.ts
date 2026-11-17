/** Smaller and in-progress work. One line each. */

export interface MoreItem {
  name: string;
  line: string;
  href?: string;
  /** Shown after the name, for things that are not finished or not solo. */
  note?: string;
}

export const more: MoreItem[] = [
  {
    name: "S3-FIFO reproduction",
    line: "Reproduced a SOSP '23 cache eviction paper on 120 traces and 2.52 billion requests. The main claim held: 14.8% fewer misses than FIFO, against the paper's 14%.",
    href: "https://github.com/lavneethora/s3fifo-repro",
  },
  {
    name: "strip-ai-tag",
    line: "Instagram kept labelling my own edited photos as AI. This removes the metadata that triggers the label without re-encoding a single pixel.",
    href: "https://github.com/lavneethora/strip-ai-tag",
  },
  {
    name: "Ripple",
    note: "in progress",
    line: "If a paper gets retracted, which conclusions built on it still stand? For the Relate by Neo4j hackathon.",
    href: "https://github.com/lavneethora/ripple",
  },
  {
    name: "Ditto",
    note: "in progress",
    line: "A Chrome extension that autofills job applications from one profile stored on your machine, with no account and no server.",
    href: "https://github.com/lavneethora/ditto",
  },
  {
    name: "Envoy",
    line: "A recruiting agent that plans an outreach sequence, reads replies, and critiques its own drafts in front of you.",
    href: "https://envoy-flax.vercel.app",
  },
  {
    name: "Football Kick Analyzer",
    line: "Ball tracking and trajectory reconstruction on a Rubik Pi 3, built in the IEEE Career Catalyst program and demoed to Qualcomm.",
  },
  {
    name: "Quantum Chess",
    note: "contributor",
    line: "Chess with superposition, entanglement and measurement, running Qiskit circuits. I built the UI, game flow and quantum move validation.",
    href: "https://github.com/JoshuaLongoria/Quantum-Chess",
  },
  {
    name: "AI Student Assistant",
    line: "A RAG chatbot over the CU Boulder student handbook, built in 24 hours. Won the AMD Ryzen AI track at HackCU12.",
  },
];
