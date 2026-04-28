import { useState } from "react";
import { T } from "../constants/theme";

export function SettingsModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.surf2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 24, width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 18 }}>Settings</div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            Anthropic API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-…"
            style={{ width: "100%", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 10px", fontSize: 12, color: T.text, fontFamily: "monospace", outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = T.indigo}
            onBlur={(e) => e.target.style.borderColor = T.border}
          />
          <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>
            Required for AI pipeline generation. Stored in localStorage only.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "8px", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 12, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={() => { onSave(key); onClose(); }} style={{ flex: 1, padding: "8px", background: T.accent, border: "none", borderRadius: 7, fontSize: 12, color: "white", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
