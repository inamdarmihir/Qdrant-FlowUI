import { useState } from "react";
import { T } from "../constants/theme";

export function SaveLoadModal({ nodes, edges, onLoad, onClose }) {
  const [name, setName]   = useState("pipeline-1");
  const [saves, setSaves] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qf_saves") || "{}"); } catch { return {}; }
  });

  const save = () => {
    const updated = { ...saves, [name]: { nodes, edges, ts: Date.now() } };
    localStorage.setItem("qf_saves", JSON.stringify(updated));
    setSaves(updated);
  };

  const load = (key) => { onLoad(saves[key]); onClose(); };

  const del = (key) => {
    const updated = { ...saves };
    delete updated[key];
    localStorage.setItem("qf_saves", JSON.stringify(updated));
    setSaves(updated);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "pipeline"}.json`;
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.nodes && data.edges) { onLoad(data); onClose(); }
      } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.surf2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 24, width: 420, maxHeight: "80vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 18 }}>Save / Load</div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="pipeline name"
            style={{ flex: 1, background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", fontSize: 12, color: T.text, fontFamily: "inherit", outline: "none" }} />
          <button onClick={save} style={{ padding: "6px 14px", background: T.accent, border: "none", borderRadius: 7, fontSize: 12, color: "white", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Save</button>
        </div>

        {Object.keys(saves).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Saved Pipelines</div>
            {Object.entries(saves).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, padding: "6px 8px", background: T.surf3, borderRadius: 7 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{k}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{v.nodes?.length} nodes · {new Date(v.ts).toLocaleDateString()}</div>
                </div>
                <button onClick={() => load(k)} style={{ padding: "3px 10px", background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 11, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>Load</button>
                <button onClick={() => del(k)} style={{ padding: "3px 6px", background: "transparent", border: "none", color: T.text3, cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <button onClick={exportJSON} style={{ flex: 1, padding: "6px", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 11, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>
            Export JSON
          </button>
          <label style={{ flex: 1, padding: "6px", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 11, color: T.text2, cursor: "pointer", textAlign: "center" }}>
            Import JSON
            <input type="file" accept=".json" onChange={importJSON} style={{ display: "none" }} />
          </label>
          <button onClick={onClose} style={{ flex: 1, padding: "6px", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 11, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
