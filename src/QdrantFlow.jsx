import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { T } from "./constants/theme";
import { NODE_DEFS, PALETTE_GROUPS } from "./constants/nodes";
import { generateCode } from "./utils/codeGenerator";
import { QdrantLogo } from "./components/QdrantLogo";
import { FlowNode } from "./components/FlowNode";
import { EdgeLayer, getPortCenter } from "./components/EdgeLayer";
import { PaletteItem } from "./components/PaletteItem";
import { PropsPanel } from "./components/PropsPanel";
import { CodePanel } from "./components/CodePanel";
import { Minimap } from "./components/Minimap";
import { SettingsModal } from "./components/SettingsModal";
import { SaveLoadModal } from "./components/SaveLoadModal";

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
let uidCounter = 1;
const uid = () => `n${uidCounter++}`;

const EXAMPLES = [
  "RAG pipeline with hybrid search using Qdrant and Claude",
  "Agentic loop with Qdrant memory and tool use",
  "Document ingestion with OpenAI embeddings into Qdrant",
  "Multi-step agent with GPT-4o and Qdrant vector memory",
  "Semantic search with Cohere reranking and Qdrant filter",
];

export default function QdrantFlow() {
  const [nodes, setNodes]       = useState([]);
  const [edges, setEdges]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [rightTab, setRightTab] = useState("props");
  const [prompt, setPrompt]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState("Ready");
  const [tempEdge, setTempEdge] = useState(null);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveLoad, setShowSaveLoad]  = useState(false);
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem("qf_api_key") || "");
  const [history, setHistory]   = useState([]);
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const [scale, setScale]       = useState(1);

  const nodesRef     = useRef(nodes);
  const panRef       = useRef(pan);
  const scaleRef     = useRef(scale);
  const draggingRef  = useRef(null);
  const dragOffset   = useRef({ x: 0, y: 0 });
  const connectRef   = useRef(null);
  const palDragType  = useRef(null);
  const isPanning    = useRef(false);
  const panStart     = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const canvasSizeRef = useRef({ w: 800, h: 600 });

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const saveApiKey = (k) => { setApiKey(k); localStorage.setItem("qf_api_key", k); };

  const pushHistory = useCallback((n, e) => {
    setHistory((h) => [...h.slice(-30), { nodes: n, edges: e }]);
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setSelectedId(null);
      return h.slice(0, -1);
    });
    setStatus("Undo");
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const code = useMemo(() => generateCode(nodes), [nodes]);

  // ── Drag node ──
  const handleNodeDragStart = useCallback((e, nodeId) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node) return;
    const canvas = document.getElementById("qf-canvas");
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    draggingRef.current = nodeId;
    // Offset in canvas-space coordinates
    const cx = (e.clientX - cr.left - panRef.current.x) / scaleRef.current;
    const cy = (e.clientY - cr.top  - panRef.current.y) / scaleRef.current;
    dragOffset.current = { x: cx - node.x, y: cy - node.y };
    e.preventDefault();
  }, []);

  // ── Port connect ──
  const handlePortStart = useCallback((e, nodeId, portName, direction) => {
    e.stopPropagation(); e.preventDefault();
    connectRef.current = { nodeId, portName, direction };
  }, []);

  const handlePortEnd = useCallback((e, nodeId, portName, direction) => {
    const conn = connectRef.current;
    if (!conn || conn.direction === direction || conn.nodeId === nodeId) {
      connectRef.current = null; setTempEdge(null); return;
    }
    const out = conn.direction === "out" ? conn : { nodeId, portName };
    const inp = conn.direction === "in"  ? conn : { nodeId, portName };
    setEdges((prev) => {
      const next = [...prev, { id: uid(), from: out.nodeId, fromPort: out.portName, to: inp.nodeId, toPort: inp.portName }];
      pushHistory(nodesRef.current, next);
      return next;
    });
    connectRef.current = null; setTempEdge(null);
  }, [pushHistory]);

  // ── Global mouse events ──
  useEffect(() => {
    const onMove = (e) => {
      const canvas = document.getElementById("qf-canvas");
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();

      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
        return;
      }

      if (draggingRef.current) {
        const cx = (e.clientX - cr.left - panRef.current.x) / scaleRef.current;
        const cy = (e.clientY - cr.top  - panRef.current.y) / scaleRef.current;
        const x = Math.round((cx - dragOffset.current.x) / 24) * 24;
        const y = Math.round((cy - dragOffset.current.y) / 24) * 24;
        setNodes((prev) => prev.map((n) => n.id === draggingRef.current
          ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n));
        return;
      }

      if (connectRef.current) {
        const fromDir = connectRef.current.direction;
        const fromPos = getPortCenter(connectRef.current.nodeId, connectRef.current.portName, fromDir);
        if (fromPos) setTempEdge({ from: fromPos, to: { x: e.clientX - cr.left, y: e.clientY - cr.top } });
      }
    };

    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null;
      }
      isPanning.current = false;
      if (connectRef.current) { connectRef.current = null; setTempEdge(null); }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ── Canvas middle-mouse pan + scroll zoom ──
  const onCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
    }
    if (e.target.id === "qf-canvas" || e.target.id === "qf-grid") setSelectedId(null);
  };

  const onCanvasWheel = (e) => {
    e.preventDefault();
    const canvas = document.getElementById("qf-canvas");
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const mouseX = e.clientX - cr.left;
    const mouseY = e.clientY - cr.top;
    const delta  = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(2.5, Math.max(0.25, scaleRef.current * delta));
    // Zoom toward cursor
    const newPanX = mouseX - (mouseX - panRef.current.x) * (newScale / scaleRef.current);
    const newPanY = mouseY - (mouseY - panRef.current.y) * (newScale / scaleRef.current);
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // ── Palette drag ──
  const onPalDragStart = (e, type) => { palDragType.current = type; };
  const onCanvasDragOver = (e) => e.preventDefault();
  const onCanvasDrop = (e) => {
    e.preventDefault();
    const type = palDragType.current;
    if (!type) return;
    const canvas = document.getElementById("qf-canvas");
    const cr = canvas.getBoundingClientRect();
    const cx = (e.clientX - cr.left - panRef.current.x) / scaleRef.current;
    const cy = (e.clientY - cr.top  - panRef.current.y) / scaleRef.current;
    const x = Math.round((cx - 96) / 24) * 24;
    const y = Math.round((cy - 40) / 24) * 24;
    addNode(type, Math.max(0, x), Math.max(0, y));
    palDragType.current = null;
  };

  const addNode = (type, x = 80, y = 80, overrides = {}) => {
    const def = NODE_DEFS[type];
    if (!def) return;
    const fields = {};
    def.fields.forEach((f) => { fields[f.key] = overrides[f.key] ?? f.default; });
    const node = { id: uid(), type, x, y, fields };
    setNodes((prev) => { const next = [...prev, node]; pushHistory(prev, edges); return next; });
  };

  const deleteNode = (id) => {
    setNodes((prev) => { const next = prev.filter((n) => n.id !== id); pushHistory(prev, edges); return next; });
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateNode = (id) => {
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node) return;
    addNode(node.type, node.x + 216, node.y + 24, node.fields);
  };

  const deleteEdge  = (id) => setEdges((prev) => prev.filter((e) => e.id !== id));
  const updateField = (nodeId, key, val) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, fields: { ...n.fields, [key]: val } } : n));
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) { deleteNode(selectedId); }
      if (e.key === "Escape") setSelectedId(null);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedId) { e.preventDefault(); duplicateNode(selectedId); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); setShowSaveLoad(true); }
      // Fit view
      if (e.key === "f" || e.key === "F") fitView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, undo]);

  const fitView = () => {
    if (!nodesRef.current.length) return;
    const xs = nodesRef.current.map((n) => n.x);
    const ys = nodesRef.current.map((n) => n.y);
    const minX = Math.min(...xs) - 40, minY = Math.min(...ys) - 40;
    const maxX = Math.max(...xs) + 232, maxY = Math.max(...ys) + 130;
    const canvas = document.getElementById("qf-canvas");
    if (!canvas) return;
    const { width: cw, height: ch } = canvas.getBoundingClientRect();
    const newScale = Math.min(0.95, Math.min(cw / (maxX - minX), ch / (maxY - minY)));
    setScale(newScale);
    setPan({ x: -minX * newScale + (cw - (maxX - minX) * newScale) / 2, y: -minY * newScale + (ch - (maxY - minY) * newScale) / 2 });
    setStatus("Fit view");
  };

  const clearAll = () => {
    pushHistory(nodes, edges);
    setNodes([]); setEdges([]); setSelectedId(null);
    setStatus("Cleared");
  };

  // ── AI Generation ──
  const generatePipeline = async () => {
    if (!prompt.trim() || loading) return;
    if (!apiKey) { setShowSettings(true); setStatus("Add API key in Settings"); return; }
    setLoading(true); setStatus("Generating pipeline…");
    try {
      const sys = `You are a pipeline architect for Qdrant-centered AI systems.
Return ONLY valid JSON — no markdown, no prose:
{
  "nodes": [{"id":"n1","type":"NODETYPE","x":NUMBER,"y":NUMBER,"fields":{"key":"value"}}],
  "edges": [{"from":"n1","fromPort":"PORT","to":"n2","toPort":"PORT"}]
}

Node types & ports:
query_input: out=[query], fields={variable}
doc_loader: out=[documents], fields={source,format}
chunker: in=[documents], out=[chunks], fields={chunk_size,overlap}
openai_embed: in=[text], out=[vector], fields={model,dims}
cohere_embed: in=[text], out=[vector], fields={model,input_type}
fastembed: in=[text], out=[vector], fields={model}
qdrant_collection: out=[vectors], fields={host,collection,vector_size}
qdrant_upsert: in=[vectors,payloads,collection], out=[status], fields={batch_size}
qdrant_search: in=[query_vector,collection], out=[results], fields={top_k,score_threshold}
qdrant_hybrid: in=[dense_vector,sparse_vector,collection], out=[results], fields={top_k,fusion,sparse_model}
qdrant_filter: in=[results], out=[filtered], fields={field,match,condition}
reranker: in=[results,query], out=[reranked], fields={model,top_n}
anthropic_llm: in=[context,query], out=[response], fields={model,max_tokens}
openai_llm: in=[context,query], out=[response], fields={model,temperature}
cohere_llm: in=[documents,query], out=[response], fields={model,temperature}
agent_loop: in=[query,tools], out=[action,final_answer], fields={max_iterations,stop_condition}
tool_caller: in=[action], out=[result], fields={tools}
output: in=[response], fields={format}

Rules: ALWAYS include at least one qdrant_* node. Layout left→right, x starts at 40, step 230. y centered around 120, step 170.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: sys,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text  = data.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON returned");
      const pipeline = JSON.parse(match[0]);

      pushHistory(nodes, edges);
      const idMap = {}, newNodes = [];
      (pipeline.nodes ?? []).forEach((nd, i) => {
        const def = NODE_DEFS[nd.type];
        if (!def) return;
        const fields = {};
        def.fields.forEach((f) => { fields[f.key] = nd.fields?.[f.key] ?? f.default; });
        const nid = uid();
        idMap[nd.id] = nid;
        newNodes.push({ id: nid, type: nd.type, x: nd.x ?? i * 230 + 40, y: nd.y ?? 120, fields });
      });
      const newEdges = (pipeline.edges ?? []).map((ed) => ({
        id: uid(), from: idMap[ed.from] ?? ed.from, fromPort: ed.fromPort,
        to: idMap[ed.to] ?? ed.to, toPort: ed.toPort,
      }));
      setNodes(newNodes); setEdges(newEdges); setSelectedId(null);
      setStatus(`Generated — ${newNodes.length} nodes, ${newEdges.length} edges`);
      setPrompt("");
      setTimeout(fitView, 100);
    } catch (err) {
      setStatus("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtered palette ──
  const filteredPalette = useMemo(() => {
    const q = paletteSearch.toLowerCase();
    return Object.entries(NODE_DEFS).filter(([, d]) =>
      !q || d.label.toLowerCase().includes(q) || d.group.toLowerCase().includes(q)
    );
  }, [paletteSearch]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Syne', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .palette-item:hover { background: rgba(255,255,255,0.04); border-color: ${T.border}; }
        .node-del:hover { background: rgba(255,255,255,0.1) !important; color: white !important; }
        .chip:hover { background: ${T.surf3} !important; border-color: ${T.indigo} !important; color: white !important; }
        input::placeholder, textarea::placeholder { color: ${T.text3}; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ height: 48, background: T.surf, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <QdrantLogo size={24} />
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em", color: T.text }}>
            Qdrant<span style={{ color: T.accent }}>Flow</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={btnStyle} onClick={clearAll} title="Clear All">Clear</button>
          <button style={btnStyle} onClick={fitView} title="Fit View (F)">Fit</button>
          <button style={btnStyle} onClick={undo} title="Undo (Ctrl+Z)" disabled={!history.length}>Undo</button>
          <div style={{ width: 1, height: 16, background: T.border2, margin: "0 4px" }} />
          <button style={{ ...btnStyle, color: T.text, borderColor: T.border2 }} onClick={() => setShowSaveLoad(true)}>
            💾 Save / Load
          </button>
          <button style={{ ...btnStyle, color: T.text, borderColor: T.border2 }} onClick={() => setShowSettings(true)}>
            ⚙ Settings
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── PALETTE ── */}
        <div style={{ width: 220, background: T.surf2, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10 }}>
          <div style={{ padding: 12, borderBottom: `1px solid ${T.border}` }}>
            <input
              placeholder="Search nodes…"
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              style={{ width: "100%", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: T.text, outline: "none", transition: "border-color 0.12s" }}
              onFocus={(e) => e.target.style.borderColor = T.indigo}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
            {paletteSearch ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase", padding: "0 10px", marginBottom: 5 }}>Results</div>
                {filteredPalette.length === 0 && <div style={{ fontSize: 11, color: T.text3, padding: "0 10px" }}>No nodes found</div>}
                {filteredPalette.map(([type, def]) => (
                  <PaletteItem key={type} type={type} def={def} onDragStart={onPalDragStart} />
                ))}
              </div>
            ) : (
              PALETTE_GROUPS.map((group) => (
                <div key={group} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase", padding: "0 10px", marginBottom: 5 }}>{group}</div>
                  {Object.entries(NODE_DEFS).filter(([, d]) => d.group === group).map(([type, def]) => (
                    <PaletteItem key={type} type={type} def={def} onDragStart={onPalDragStart} />
                  ))}
                </div>
              ))
            )}
          </div>
          <div style={{ padding: "8px 10px", borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.text3, lineHeight: 1.6 }}>
            <div>Drag to canvas · Click field to edit</div>
            <div>Del — delete · F — fit · Ctrl+Z — undo</div>
            <div>Ctrl+D — duplicate · Alt+drag — pan</div>
          </div>
        </div>

        {/* ── CANVAS ── */}
        <div
          id="qf-canvas"
          ref={(el) => { if (el) canvasSizeRef.current = { w: el.offsetWidth, h: el.offsetHeight }; }}
          style={{
            flex: 1, position: "relative", overflow: "hidden", cursor: isPanning.current ? "grabbing" : "default",
            background: `radial-gradient(ellipse at 15% 85%, rgba(230,57,70,0.04) 0%, transparent 55%),
                         radial-gradient(ellipse at 85% 15%, rgba(99,102,241,0.04) 0%, transparent 55%), ${T.bg}`,
          }}
          onMouseDown={onCanvasMouseDown}
          onWheel={onCanvasWheel}
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          {/* Grid */}
          <div id="qf-grid" style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`,
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${pan.x % (24 * scale)}px ${pan.y % (24 * scale)}px`,
            pointerEvents: "none",
          }} />

          <div style={{ position: "absolute", top: 10, left: 12, fontSize: 10, color: T.text3, pointerEvents: "none", letterSpacing: "0.04em", zIndex: 50 }}>
            Drag from palette · Connect ports · Alt+drag or middle-click to pan · Scroll to zoom
          </div>

          {/* Transformed content group */}
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
            {nodes.map((node) => (
              <FlowNode
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onSelect={setSelectedId}
                onDelete={deleteNode}
                onDuplicate={duplicateNode}
                onDragStart={handleNodeDragStart}
                onPortStart={handlePortStart}
                onPortEnd={handlePortEnd}
                onFieldChange={updateField}
              />
            ))}
          </div>

          {/* Edges overlay (screen-space, not transformed) */}
          <EdgeLayer edges={edges} onDeleteEdge={deleteEdge} tempEdge={tempEdge} />

          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 40, opacity: 0.12, marginBottom: 10 }}>⬡</div>
              <div style={{ fontSize: 14, color: T.text2, fontWeight: 500, marginBottom: 6 }}>Describe your pipeline below</div>
              <div style={{ fontSize: 12, color: T.text3 }}>or drag nodes from the palette</div>
            </div>
          )}

          {/* Example chips */}
          {nodes.length === 0 && (
            <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", width: "min(700px, calc(100% - 32px))", zIndex: 50 }}>
              {EXAMPLES.map((ex) => (
                <div key={ex} className="chip" onClick={() => setPrompt(ex)}
                  style={{ padding: "5px 10px", background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 11, color: T.text2, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.12s" }}>
                  {ex}
                </div>
              ))}
            </div>
          )}

          {/* Prompt bar */}
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: "min(680px, calc(100% - 28px))", background: T.surf2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: "9px 10px", display: "flex", gap: 8, alignItems: "flex-end", zIndex: 50, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generatePipeline(); } }}
              placeholder={apiKey ? "Describe your pipeline… (Enter to generate)" : "Set Anthropic API key in ⚙ Settings, then describe your pipeline…"}
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 13, resize: "none", lineHeight: 1.5, minHeight: 20, maxHeight: 100, overflowY: "auto" }}
            />
            <button
              onClick={generatePipeline}
              disabled={loading || !prompt.trim()}
              style={{ width: 32, height: 32, borderRadius: 8, background: loading ? T.surf3 : T.accent, border: "none", color: "white", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, transition: "all 0.15s" }}
            >
              {loading
                ? <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="7" cy="7" r="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M7 2a5 5 0 0 1 5 5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                : "↑"}
            </button>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(9,11,16,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
              <div style={{ background: T.surf2, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "20px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, border: `2px solid ${T.border2}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 12, color: T.text2 }}>Generating pipeline…</div>
              </div>
            </div>
          )}

          {/* Minimap */}
          <Minimap
            nodes={nodes} pan={pan} scale={scale}
            canvasW={canvasSizeRef.current.w} canvasH={canvasSizeRef.current.h}
          />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width: 270, background: T.surf, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {["props", "code"].map((tab) => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: 1, padding: 10, fontSize: 10, fontWeight: 700, textAlign: "center", cursor: "pointer", color: rightTab === tab ? T.text : T.text3, border: "none", background: "transparent", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: rightTab === tab ? `2px solid ${T.accent}` : "2px solid transparent", transition: "all 0.12s" }}>
                {tab === "props" ? "Properties" : "Code"}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {rightTab === "props"
              ? <PropsPanel node={selectedNode} onFieldChange={updateField} />
              : <CodePanel code={code} />}
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ height: 22, borderTop: `1px solid ${T.border}`, background: T.surf, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, fontSize: 10, color: T.text3, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? T.amber : T.green }} />
        <span>{loading ? "Generating…" : "Ready"}</span>
        <span style={{ color: apiKey ? T.green : T.amber, marginLeft: 4 }}>{apiKey ? "API key set" : "No API key"}</span>
        <span style={{ marginLeft: "auto" }}>{status}</span>
        <span style={{ color: T.text3 }}>· zoom {Math.round(scale * 100)}%</span>
      </div>

      {/* ── MODALS ── */}
      {showSettings && (
        <SettingsModal apiKey={apiKey} onSave={saveApiKey} onClose={() => setShowSettings(false)} />
      )}
      {showSaveLoad && (
        <SaveLoadModal
          nodes={nodes} edges={edges}
          onLoad={({ nodes: n, edges: e }) => { pushHistory(nodes, edges); setNodes(n); setEdges(e); setSelectedId(null); setTimeout(fitView, 100); }}
          onClose={() => setShowSaveLoad(false)}
        />
      )}
    </div>
  );
}

// shared button style
const btnStyle = {
  padding: "4px 9px", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
  fontSize: 11, color: "#7a8099", cursor: "pointer",
  fontFamily: "'Syne', 'Segoe UI', sans-serif",
  transition: "all 0.12s",
};
