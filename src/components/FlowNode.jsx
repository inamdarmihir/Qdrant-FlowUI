import { useState, useRef } from "react";
import { T } from "../constants/theme";
import { NODE_DEFS } from "../constants/nodes";
import { Port } from "./Port";

export function FlowNode({ node, selected, onSelect, onDelete, onDuplicate, onDragStart, onPortStart, onPortEnd, onFieldChange }) {
  const def = NODE_DEFS[node.type];
  if (!def) return null;
  const [editingKey, setEditingKey] = useState(null);
  const [editVal, setEditVal] = useState("");
  const inputRef = useRef(null);

  const startEdit = (e, key, val) => {
    e.stopPropagation();
    setEditingKey(key);
    setEditVal(val);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const commitEdit = () => {
    if (editingKey) { onFieldChange(node.id, editingKey, editVal); setEditingKey(null); }
  };

  return (
    <div
      style={{
        position: "absolute", left: node.x, top: node.y, width: 192,
        background: T.surf2,
        border: `1px solid ${selected ? T.indigo : (def.isQdrant ? "rgba(230,57,70,0.35)" : T.border)}`,
        borderRadius: 10, cursor: "move", userSelect: "none",
        boxShadow: selected
          ? `0 0 0 1px ${T.indigo}, 0 8px 24px rgba(0,0,0,0.4)`
          : "0 2px 12px rgba(0,0,0,0.3)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        zIndex: selected ? 20 : 10,
      }}
      onMouseDown={(e) => {
        if (e.target.closest(".port-dot") || e.target.closest(".node-del") || e.target.tagName === "INPUT") return;
        onSelect(node.id);
        onDragStart(e, node.id);
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: def.colorBg, color: def.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: "-0.02em",
        }}>
          {def.icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {def.label}
        </span>
        <span style={{
          fontSize: 9, padding: "2px 5px", borderRadius: 4,
          background: def.colorBg, color: def.color,
          fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
        }}>
          {def.group}
        </span>
        <button className="node-del" title="Duplicate (D)"
          onClick={(e) => { e.stopPropagation(); onDuplicate(node.id); }}
          style={{ width: 16, height: 16, borderRadius: 4, background: "transparent", border: "none", color: T.text3, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
          ⎘
        </button>
        <button className="node-del" title="Delete (Del)"
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          style={{ width: 16, height: 16, borderRadius: 4, background: "transparent", border: "none", color: T.text3, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
          ×
        </button>
      </div>

      {/* Fields — click value to edit inline */}
      <div style={{ padding: "7px 9px" }}>
        {def.fields.map((f) => (
          <div key={f.key} style={{ marginBottom: 5 }}>
            <div style={{ fontSize: 9, color: T.text3, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
            {editingKey === f.key ? (
              <input
                ref={inputRef}
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingKey(null); }}
                style={{
                  width: "100%", fontSize: 11, color: T.text, fontFamily: "monospace",
                  background: T.surf3, padding: "3px 6px", borderRadius: 4,
                  border: `1px solid ${T.indigo}`, outline: "none",
                }}
              />
            ) : (
              <div
                onClick={(e) => startEdit(e, f.key, node.fields[f.key])}
                title="Click to edit"
                style={{
                  fontSize: 11, color: T.text2, fontFamily: "monospace",
                  background: T.surf3, padding: "3px 6px", borderRadius: 4,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  cursor: "text", border: "1px solid transparent",
                  transition: "border-color 0.12s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = T.border2}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
              >
                {node.fields[f.key]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ports */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 9px 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {def.ports_in.map((p) => (
            <Port key={p} nodeId={node.id} portName={p} direction="in" onStart={onPortStart} onEnd={onPortEnd} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
          {def.ports_out.map((p) => (
            <Port key={p} nodeId={node.id} portName={p} direction="out" onStart={onPortStart} onEnd={onPortEnd} />
          ))}
        </div>
      </div>
    </div>
  );
}
