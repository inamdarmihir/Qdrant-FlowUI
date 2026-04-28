import { T } from "../constants/theme";
import { NODE_DEFS } from "../constants/nodes";

export function Minimap({ nodes, pan, scale, canvasW, canvasH }) {
  const W = 140, H = 90;
  if (!nodes.length) return null;

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + 210;
  const maxY = Math.max(...ys) + 120;
  const bw = maxX - minX || 1;
  const bh = maxY - minY || 1;
  const sc = Math.min(W / bw, H / bh);

  const toMini = (x, y) => ({ x: (x - minX) * sc, y: (y - minY) * sc });

  // Viewport rect in node-space
  const vpX = (-pan.x / scale) - minX;
  const vpY = (-pan.y / scale) - minY;
  const vpW = (canvasW / scale);
  const vpH = (canvasH / scale);

  return (
    <div style={{
      position: "absolute", bottom: 72, right: 12, width: W, height: H,
      background: "rgba(15,18,25,0.92)", border: `1px solid ${T.border2}`,
      borderRadius: 8, overflow: "hidden", zIndex: 60,
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    }}>
      <svg width={W} height={H}>
        {nodes.map((n) => {
          const def = NODE_DEFS[n.type];
          const p = toMini(n.x, n.y);
          return (
            <rect key={n.id}
              x={p.x} y={p.y} width={192 * sc} height={80 * sc}
              rx={2} fill={def?.colorBg ?? T.surf3}
              stroke={def?.color ?? T.border} strokeWidth={0.5} opacity={0.9}
            />
          );
        })}
        {/* viewport indicator */}
        <rect
          x={vpX * sc} y={vpY * sc}
          width={vpW * sc} height={vpH * sc}
          fill="none" stroke={T.indigo} strokeWidth={1} opacity={0.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
