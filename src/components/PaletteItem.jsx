import { T } from "../constants/theme";

export function PaletteItem({ type, def, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className="palette-item"
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderRadius: 7, cursor: "grab",
        border: "1px solid transparent", marginBottom: 2,
        transition: "all 0.12s",
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        background: def.colorBg, color: def.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, flexShrink: 0,
      }}>
        {def.icon}
      </div>
      <span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>{def.label}</span>
    </div>
  );
}
