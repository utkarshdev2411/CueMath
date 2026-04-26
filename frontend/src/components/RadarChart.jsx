import "./RadarChart.css";

/**
 * RadarChart — pure-SVG spider chart for the 5 assessment dimensions.
 *
 * Props:
 *   - dimensions: { clarity: {score}, simplification: {...}, ... }
 *   - size: overall px size of the chart (square). Defaults to 320.
 *   - maxScore: domain ceiling (5 for our rubric).
 *
 * Matches the Cuemath neo-brutalist style: 2px black borders, hard drop
 * shadow on the polygon, bold axis labels in Poppins. No external libraries.
 */
const DIMENSION_ORDER = ["clarity", "simplification", "warmth", "patience", "fluency"];
const DIMENSION_LABELS = {
  clarity: "Clarity",
  simplification: "Simplify",
  warmth: "Warmth",
  patience: "Patience",
  fluency: "Fluency",
};

export default function RadarChart({ dimensions = {}, size = 320, maxScore = 5 }) {
  const cx = size / 2;
  const cy = size / 2;
  const padding = 56; // leave room for labels on all sides
  const radius = size / 2 - padding;
  const axes = DIMENSION_ORDER.length;

  // Angle for axis i (start at 12 o'clock, go clockwise).
  const angleFor = (i) => -Math.PI / 2 + (2 * Math.PI * i) / axes;

  const pointFor = (i, value) => {
    const a = angleFor(i);
    const r = (value / maxScore) * radius;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };

  // Grid rings at scores 1..maxScore
  const rings = [];
  for (let s = 1; s <= maxScore; s += 1) {
    const pts = DIMENSION_ORDER.map((_, i) => pointFor(i, s));
    rings.push({
      score: s,
      d: `M ${pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ")} Z`,
    });
  }

  // Axis spokes
  const spokes = DIMENSION_ORDER.map((_, i) => {
    const p = pointFor(i, maxScore);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  // Candidate polygon
  const scoreValues = DIMENSION_ORDER.map((dim) => {
    const raw = dimensions?.[dim]?.score;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(maxScore, n));
  });
  const polyPoints = scoreValues.map((v, i) => pointFor(i, v));
  const polygonD = `M ${polyPoints.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ")} Z`;

  // Axis label positions (pushed out slightly past the outermost ring)
  const labelPositions = DIMENSION_ORDER.map((_, i) => {
    const a = angleFor(i);
    const r = radius + 24;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      anchor: Math.abs(Math.cos(a)) < 0.25 ? "middle" : Math.cos(a) > 0 ? "start" : "end",
      baseline: Math.sin(a) < -0.5 ? "auto" : Math.sin(a) > 0.5 ? "hanging" : "middle",
    };
  });

  return (
    <div className="radar" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="radar-svg"
        role="img"
        aria-label="Score radar chart"
      >
        <defs>
          <filter id="radar-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="3" dy="3" result="off" />
            <feFlood floodColor="#1A1A1A" />
            <feComposite in2="off" operator="in" />
          </filter>
        </defs>

        {/* Grid rings — faintest inner, darker outer */}
        {rings.map((ring) => (
          <path
            key={ring.score}
            d={ring.d}
            className={`radar-ring radar-ring-${ring.score}`}
          />
        ))}

        {/* Axis spokes */}
        {spokes.map((s, i) => (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            className="radar-spoke"
          />
        ))}

        {/* Candidate polygon — shadow copy first for neo-brutalist offset */}
        <path d={polygonD} className="radar-polygon-shadow" transform="translate(4 4)" />
        <path d={polygonD} className="radar-polygon" />

        {/* Vertex dots */}
        {polyPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            className="radar-vertex"
          />
        ))}

        {/* Axis labels */}
        {labelPositions.map((pos, i) => {
          const dim = DIMENSION_ORDER[i];
          const val = scoreValues[i];
          return (
            <g key={dim} className="radar-label-group">
              <text
                x={pos.x}
                y={pos.y}
                className="radar-label"
                textAnchor={pos.anchor}
                dominantBaseline={pos.baseline}
              >
                {DIMENSION_LABELS[dim]}
              </text>
              <text
                x={pos.x}
                y={pos.y + 14}
                className="radar-label-score"
                textAnchor={pos.anchor}
                dominantBaseline={pos.baseline}
              >
                {val.toFixed(1)}/{maxScore}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
