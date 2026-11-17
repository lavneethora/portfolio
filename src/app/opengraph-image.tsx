import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { FIGURE_EIGHT_PERIOD_DAYS } from "@/sim/figureEight";
import { OrbitSim } from "@/sim/orbit";

export const alt = "Lavneet Hora, software engineer. A figure-eight orbit drawn in ink on graph paper.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One lap of the real orbit, as an SVG path centred on (cx, cy). */
function orbitPath(cx: number, cy: number, scale: number): string {
  const sim = new OrbitSim();
  const samples = 160;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = cx + sim.state.pos[0] * scale;
    const y = cy - sim.state.pos[1] * scale;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    sim.advance(FIGURE_EIGHT_PERIOD_DAYS / samples, Infinity);
  }
  return d;
}

export default function OpengraphImage() {
  const paper = "#ecebdc";
  const ink = "#16191f";
  const cx = 860;
  const cy = 250;
  const scale = 230;

  // Where the three bodies sit at t = 0.
  const start = new OrbitSim().state.pos;
  const bodies = [0, 1, 2].map((i) => ({
    x: cx + start[i * 3] * scale,
    y: cy - start[i * 3 + 1] * scale,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: paper,
          color: ink,
          backgroundImage:
            "linear-gradient(rgba(52,110,86,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(52,110,86,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path d={orbitPath(cx, cy, scale)} fill="none" stroke={ink} strokeWidth="3" />
          {bodies.map((b) => (
            <circle key={`${b.x}-${b.y}`} cx={b.x} cy={b.y} r="10" fill={ink} />
          ))}
        </svg>
        <div style={{ display: "flex", fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 34, maxWidth: 820 }}>
          Computer science at Texas Tech. I build software and ship it.
        </div>
      </div>
    ),
    size,
  );
}
