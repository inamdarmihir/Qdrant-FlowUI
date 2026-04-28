import { T } from "../constants/theme";
import { NODE_DEFS } from "../constants/nodes";

export function PropsPanel({ node, onFieldChange }) {
  if (!node) {
    return (
      <div style={{ padding: "28px 14px", textAlign: "center", color: T.text3, fontSize: 11 }}>
        <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>⬡</div>
        Select a node to edit properties
      </div>
    );
  }
  const def = NODE_DEFS[node.type];
  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: def.colorBg, color: def.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
          {def.icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{def.label}</div>
          <div style={{ fontSize: 10, color: T.text3 }}>{def.group} · {node.id}</div>
        </div>
      </div>
      {def.fields.map((f) => (
        <div key={f.key} style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 10, color: T.text3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {f.label}
          </label>
          <input
            value={node.fields[f.key] ?? ""}
            onChange={(e) => onFieldChange(node.id, f.key, e.target.value)}
            style={{
              width: "100%", background: T.surf3, border: `1px solid ${T.border}`,
              borderRadius: 6, padding: "5px 8px", fontSize: 11,
              color: T.text, fontFamily: "monospace", outline: "none",
              transition: "border-color 0.12s",
            }}
            onFocus={(e) => e.target.style.borderColor = T.indigo}
            onBlur={(e) => e.target.style.borderColor = T.border}
          />
        </div>
      ))}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Ports In</div>
        {def.ports_in.length
          ? def.ports_in.map((p) => <div key={p} style={{ fontSize: 11, color: T.text2, fontFamily: "monospace", marginBottom: 3 }}>← {p}</div>)
          : <div style={{ fontSize: 11, color: T.text3 }}>None</div>}
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, marginTop: 10 }}>Ports Out</div>
        {def.ports_out.length
          ? def.ports_out.map((p) => <div key={p} style={{ fontSize: 11, color: T.text2, fontFamily: "monospace", marginBottom: 3 }}>{p} →</div>)
          : <div style={{ fontSize: 11, color: T.text3 }}>None</div>}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Position</div>
        <div style={{ fontSize: 11, color: T.text2, fontFamily: "monospace" }}>x: {node.x}, y: {node.y}</div>
      </div>
    </div>
  );
}
