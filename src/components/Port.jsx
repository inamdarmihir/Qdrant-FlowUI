import { T } from "../constants/theme";

export function Port({ nodeId, portName, direction, onStart, onEnd }) {
  return (
    <div
      id={`port__${nodeId}__${direction}__${portName}`}
      style={{
        display: "flex", alignItems: "center", gap: 5, padding: "2px 0",
        cursor: "crosshair",
        flexDirection: direction === "out" ? "row-reverse" : "row",
      }}
      onMouseDown={(e) => { e.stopPropagation(); onStart(e, nodeId, portName, direction); }}
      onMouseUp={(e) => { e.stopPropagation(); onEnd(e, nodeId, portName, direction); }}
    >
      <div
        className={`port-dot port-dot-${direction}`}
        style={{
          width: 8, height: 8, borderRadius: "50%",
          border: `1.5px solid ${T.text3}`, background: T.surf2,
          transition: "all 0.12s", flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 10, color: T.text3, fontFamily: "monospace" }}>{portName}</span>
    </div>
  );
}
