# Portfolio

My personal site. One page, ink on graph paper, with a live three-body orbit at the top that you can pick up and throw.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What is where

| Path | What it holds |
| --- | --- |
| `src/content/` | All the words on the page. Edit these to change text. |
| `src/data/prs.json` | My open source pull requests, pulled from GitHub. |
| `src/sim/` | The gravity simulation behind the hero, with tests. |
| `src/components/Orbit.tsx` | The hero canvas and its drag-to-throw interaction. |
| `src/app/globals.css` | Colors, type and layout. |
| `public/work/` | Project screenshots. |
| `public/resume.pdf` | The resume the contact section links to. |

## The orbit

The hero is the Chenciner-Montgomery figure eight: three equal masses chasing each other around one closed path. It runs on the Yoshida fourth-order integrator from [three-body](https://github.com/lavneethora/three-body), copied into `src/sim/`.

Left alone it uses a fixed step, which keeps the integrator symplectic and the orbit closed. Throw a body and it switches to an adaptive step, because a perturbed system has close passes that a fixed step cannot handle. The energy drift in the readout is computed from the live state every time it updates.

## Commands

```bash
npm test        # physics tests
npm run lint    # ESLint
npm run build   # production build
npm run prs     # refresh src/data/prs.json from GitHub
```

## Deploying

Deployed on Vercel at [lavneethora.me](https://lavneethora.me). Pushing to `main` deploys.

The production domain is the default in `src/lib/site.ts`, so canonical links, the sitemap and the link preview card are right without any environment variable. Set `NEXT_PUBLIC_SITE_URL` only to override it, for example on a preview build.
