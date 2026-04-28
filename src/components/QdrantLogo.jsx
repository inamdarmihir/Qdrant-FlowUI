import { T } from "../constants/theme";

export function QdrantLogo({ size = 28 }) {
  // Faithful recreation of the Qdrant geometric mark:
  // three rhombuses forming an isometric cube (top · left · right faces)
  const s = size;
  const cx = s / 2, cy = s / 2;
  // Six vertices of the enclosing hexagon
  const top   = [cx,          cy - s * 0.42];
  const tl    = [cx - s * 0.4, cy - s * 0.14];
  const tr    = [cx + s * 0.4, cy - s * 0.14];
  const bl    = [cx - s * 0.4, cy + s * 0.14];
  const br    = [cx + s * 0.4, cy + s * 0.14];
  const bot   = [cx,          cy + s * 0.42];
  const mid   = [cx,          cy];

  const pt = (pts) => pts.map((p) => p.join(",")).join(" ");

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ flexShrink: 0 }}>
      {/* top face */}
      <polygon points={pt([top, tr, mid, tl])} fill={T.accent} />
      {/* left face */}
      <polygon points={pt([tl, mid, bot, bl])} fill="rgba(230,57,70,0.55)" />
      {/* right face */}
      <polygon points={pt([mid, tr, br, bot])} fill="rgba(230,57,70,0.75)" />
      {/* inner edge lines for definition */}
      <line x1={mid[0]} y1={mid[1]} x2={top[0]} y2={top[1]} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      <line x1={mid[0]} y1={mid[1]} x2={bl[0]}  y2={bl[1]}  stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      <line x1={mid[0]} y1={mid[1]} x2={br[0]}  y2={br[1]}  stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
    </svg>
  );
}
