/**
 * Ceremoni has no screen to photograph, so this is the pipeline drawn out:
 * one recording, three readings across two models, a vote, then speech.
 */
export function CeremoniDiagram() {
  const ink = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const label = {
    fill: "currentColor",
    fontSize: 15,
    fontFamily: "var(--font-sans)",
  };
  const small = { ...label, fontSize: 13, opacity: 0.7 };

  return (
    <svg
      viewBox="0 0 640 400"
      role="img"
      aria-label="Diagram: a student's recording is read three times by two audio models, the most common phonetic reading wins a vote, and Azure TTS speaks it at the ceremony."
    >
      {/* The recording */}
      <path
        {...ink}
        d="M28 200h10m8-14v28m10-46v64m10-40v16m10-52v88m10-70v52m10-30v8m10-44v80m10-58v36m10-24v12m10-6h10"
      />
      <text {...label} x="28" y="290">
        one recording
      </text>
      <text {...small} x="28" y="310">
        the student says their name
      </text>

      {/* Fan out to three readings */}
      <path {...ink} d="M176 200c40 0 40-110 84-110M176 200h84M176 200c40 0 40 110 84 110" />

      {[90, 200, 310].map((y, i) => (
        <g key={y}>
          <rect {...ink} x="264" y={y - 22} width="112" height="44" rx="3" />
          <text {...label} x="320" y={y + 5} textAnchor="middle">
            reading {i + 1}
          </text>
        </g>
      ))}
      <text {...small} x="320" y="368" textAnchor="middle">
        across 2 audio models
      </text>

      {/* Converge on the vote */}
      <path {...ink} d="M380 90c40 0 36 110 72 110M380 200h72M380 310c40 0 36-110 72-110" />
      <circle {...ink} cx="476" cy="200" r="22" />
      <path {...ink} d="M466 200l7 8 14-17" />
      <text {...label} x="476" y="252" textAnchor="middle">
        most common wins
      </text>

      {/* Out to speech */}
      <path {...ink} d="M500 200h44m-9-7 9 7-9 7" />
      <path {...ink} d="M560 190h12l16-14v48l-16-14h-12z" />
      <path {...ink} d="M598 186c6 8 6 20 0 28M608 176c11 14 11 34 0 48" />
      <text {...label} x="584" y="252" textAnchor="middle">
        Azure TTS
      </text>
      <text {...small} x="584" y="272" textAnchor="middle">
        read at the ceremony
      </text>
    </svg>
  );
}
