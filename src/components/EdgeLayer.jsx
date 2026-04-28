import { useState, useEffect } from "react";
import { T } from "../constants/theme";

export function getPortCenter(nodeId, portName, direction, canvasId = "qf-canvas") {
  const el = document.getElementById(`port__${nodeId}__${direction}__${portName}`);
  if (!el) return null;
  const dot = el.querySelector(".port-dot");
  if (!dot) return null;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const cr = canvas.getBoundingClientRect();
  const dr = dot.getBoundingClientRect();
  return { x: dr.left + dr.width / 2 - cr.left, y: dr.top + dr.height / 2 - cr.top };
}

export function EdgeLayer({ edges, onDeleteEdge, tempEdge }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  const renderPath = (fromPos, toPos, key, deletable, edgeId) => {
    if (!fromPos || !toPos) return null;
    const dx = Math.abs(toPos.x - fromPos.x) * 0.5;
    const d = `M${fromPos.x},${fromPos.y} C${fromPos.x + dx},${fromPos.y} ${toPos.x - dx},${toPos.y} ${toPos.x},${toPos.y}`;
    const mx = (fromPos.x + toPos.x) / 2;
    const my = (fromPos.y + toPos.y) / 2;
    return (
      <g key={key}>
        <path d={d} fill="none" stroke="transparent" strokeWidth={12} style={{ cursor: "pointer" }} />
        <path d={d} fill="none" stroke={T.indigo} strokeWidth={1.5}
          strokeOpacity={deletable ? 0.55 : 0.3}
          strokeDasharray={deletable ? "" : "5 4"} />
        {deletable && (
          <g style={{ cursor: "pointer" }} onClick={() => onDeleteEdge(edgeId)}>
            <circle cx={mx} cy={my} r={9} fill={T.surf2} stroke={T.border2} strokeWidth={1} opacity={0} className="edge-del-c" />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize={12} fill={T.text3} opacity={0} className="edge-del-t">×</text>
          </g>
        )}
      </g>
    );
  };

  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 5 }} width="100%" height="100%">
      <style>{`
        g:hover .edge-del-c, g:hover .edge-del-t { opacity: 1 !important; }
        g:has(.edge-del-c) { pointer-events: all; }
      `}</style>
      {edges.map((edge) => {
        const from = getPortCenter(edge.from, edge.fromPort, "out");
        const to   = getPortCenter(edge.to,   edge.toPort,   "in");
        return renderPath(from, to, edge.id, true, edge.id);
      })}
      {tempEdge && renderPath(tempEdge.from, tempEdge.to, "temp", false, null)}
    </svg>
  );
}
