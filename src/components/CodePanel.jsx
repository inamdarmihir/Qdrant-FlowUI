import { useState } from "react";
import { T } from "../constants/theme";

export function CodePanel({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qdrant_pipeline.py";
    a.click();
  };

  const highlight = (line) => line
    .replace(/\b(from|import|for|in|if|return|def|class|break|async|await|with|as)\b/g, `<span style="color:#c792ea">$1</span>`)
    .replace(/\b(True|False|None)\b/g, `<span style="color:#f78c6c">$1</span>`)
    .replace(/"([^"]*)"/g, `<span style="color:#c3e88d">"$1"</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, `<span style="color:#f78c6c">$1</span>`)
    .replace(/^(#.*)$/gm, `<span style="color:#546e7a;font-style:italic">$1</span>`);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", gap: 4, padding: "8px 8px 4px", background: T.surf, borderBottom: `1px solid ${T.border}` }}>
        <button onClick={copy} style={{ flex: 1, padding: "4px 8px", background: T.surf3, border: `1px solid ${T.border2}`, borderRadius: 5, fontSize: 10, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <button onClick={download} style={{ flex: 1, padding: "4px 8px", background: T.surf3, border: `1px solid ${T.border2}`, borderRadius: 5, fontSize: 10, color: T.text2, cursor: "pointer", fontFamily: "inherit" }}>
          ↓ .py
        </button>
      </div>
      <pre style={{ padding: 12, fontFamily: "monospace", fontSize: 11, lineHeight: 1.7, color: T.text2, whiteSpace: "pre", overflowX: "auto", margin: 0 }}>
        {code.split("\n").map((line, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: highlight(line) || " " }} />
        ))}
      </pre>
    </div>
  );
}
