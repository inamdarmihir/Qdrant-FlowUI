import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#090b10",
  surf:    "#0f1219",
  surf2:   "#151a24",
  surf3:   "#1c2333",
  border:  "rgba(255,255,255,0.06)",
  border2: "rgba(255,255,255,0.11)",
  text:    "#dde1ec",
  text2:   "#7a8099",
  text3:   "#3f4459",
  accent:  "#e63946",
  accent2: "#ff6b74",
  indigo:  "#6366f1",
  indigo2: "#818cf8",
  green:   "#10b981",
  amber:   "#f59e0b",
  blue:    "#3b82f6",
  purple:  "#a855f7",
  teal:    "#14b8a6",
};

// ─── NODE DEFINITIONS ─────────────────────────────────────────────────────────
const NODE_DEFS = {
  qdrant_collection: {
    label: "Collection", group: "Qdrant", icon: "QC",
    color: T.accent, colorBg: "rgba(230,57,70,0.12)", isQdrant: true,
    fields: [
      { key: "host",        label: "Host",        default: "localhost:6333" },
      { key: "collection",  label: "Collection",  default: "my_collection"  },
      { key: "vector_size", label: "Vector Size", default: "1536"           },
    ],
    ports_in: [], ports_out: ["vectors"],
  },
  qdrant_search: {
    label: "Vector Search", group: "Qdrant", icon: "QS",
    color: T.accent, colorBg: "rgba(230,57,70,0.12)", isQdrant: true,
    fields: [
      { key: "top_k",           label: "Top K",           default: "5"   },
      { key: "score_threshold", label: "Score Threshold", default: "0.7" },
    ],
    ports_in: ["query_vector", "collection"], ports_out: ["results"],
  },
  qdrant_hybrid: {
    label: "Hybrid Search", group: "Qdrant", icon: "QH",
    color: T.accent, colorBg: "rgba(230,57,70,0.12)", isQdrant: true,
    fields: [
      { key: "top_k",        label: "Top K",        default: "5"    },
      { key: "fusion",       label: "Fusion",       default: "RRF"  },
      { key: "sparse_model", label: "Sparse Model", default: "bm25" },
    ],
    ports_in: ["dense_vector", "sparse_vector", "collection"], ports_out: ["results"],
  },
  qdrant_upsert: {
    label: "Upsert Points", group: "Qdrant", icon: "QU",
    color: T.accent, colorBg: "rgba(230,57,70,0.12)", isQdrant: true,
    fields: [{ key: "batch_size", label: "Batch Size", default: "100" }],
    ports_in: ["vectors", "payloads", "collection"], ports_out: ["status"],
  },
  qdrant_filter: {
    label: "Filter", group: "Qdrant", icon: "QF",
    color: T.accent, colorBg: "rgba(230,57,70,0.12)", isQdrant: true,
    fields: [
      { key: "field",     label: "Field",     default: "category"  },
      { key: "match",     label: "Match",     default: "news"      },
      { key: "condition", label: "Condition", default: "must"      },
    ],
    ports_in: ["results"], ports_out: ["filtered"],
  },
  openai_embed: {
    label: "OpenAI Embed", group: "Embeddings", icon: "OE",
    color: T.green, colorBg: "rgba(16,185,129,0.12)",
    fields: [
      { key: "model", label: "Model", default: "text-embedding-3-small" },
      { key: "dims",  label: "Dims",  default: "1536"                   },
    ],
    ports_in: ["text"], ports_out: ["vector"],
  },
  cohere_embed: {
    label: "Cohere Embed", group: "Embeddings", icon: "CE",
    color: T.blue, colorBg: "rgba(59,130,246,0.12)",
    fields: [
      { key: "model",      label: "Model",      default: "embed-english-v3.0" },
      { key: "input_type", label: "Input Type", default: "search_document"    },
    ],
    ports_in: ["text"], ports_out: ["vector"],
  },
  fastembed: {
    label: "FastEmbed", group: "Embeddings", icon: "FE",
    color: T.amber, colorBg: "rgba(245,158,11,0.12)",
    fields: [{ key: "model", label: "Model", default: "BAAI/bge-small-en-v1.5" }],
    ports_in: ["text"], ports_out: ["vector"],
  },
  anthropic_llm: {
    label: "Claude", group: "LLM", icon: "AN",
    color: T.purple, colorBg: "rgba(168,85,247,0.12)",
    fields: [
      { key: "model",      label: "Model",      default: "claude-sonnet-4-6" },
      { key: "max_tokens", label: "Max Tokens", default: "2048"              },
    ],
    ports_in: ["context", "query"], ports_out: ["response"],
  },
  openai_llm: {
    label: "GPT-4o", group: "LLM", icon: "GP",
    color: T.green, colorBg: "rgba(16,185,129,0.12)",
    fields: [
      { key: "model",       label: "Model",       default: "gpt-4o" },
      { key: "temperature", label: "Temperature", default: "0.0"    },
    ],
    ports_in: ["context", "query"], ports_out: ["response"],
  },
  cohere_llm: {
    label: "Command R+", group: "LLM", icon: "CO",
    color: T.blue, colorBg: "rgba(59,130,246,0.12)",
    fields: [
      { key: "model",       label: "Model",       default: "command-r-plus" },
      { key: "temperature", label: "Temperature", default: "0.0"            },
    ],
    ports_in: ["documents", "query"], ports_out: ["response"],
  },
  doc_loader: {
    label: "Doc Loader", group: "Data", icon: "DL",
    color: T.teal, colorBg: "rgba(20,184,166,0.12)",
    fields: [
      { key: "source", label: "Source", default: "./docs"     },
      { key: "format", label: "Format", default: "pdf,txt,md" },
    ],
    ports_in: [], ports_out: ["documents"],
  },
  chunker: {
    label: "Chunker", group: "Data", icon: "CH",
    color: T.teal, colorBg: "rgba(20,184,166,0.12)",
    fields: [
      { key: "chunk_size", label: "Chunk Size", default: "512" },
      { key: "overlap",    label: "Overlap",    default: "64"  },
    ],
    ports_in: ["documents"], ports_out: ["chunks"],
  },
  query_input: {
    label: "Query Input", group: "Data", icon: "QI",
    color: T.indigo, colorBg: "rgba(99,102,241,0.12)",
    fields: [{ key: "variable", label: "Variable", default: "user_query" }],
    ports_in: [], ports_out: ["query"],
  },
  reranker: {
    label: "Reranker", group: "Data", icon: "RR",
    color: T.teal, colorBg: "rgba(20,184,166,0.12)",
    fields: [
      { key: "model", label: "Model", default: "cohere-rerank-v3.5" },
      { key: "top_n", label: "Top N", default: "3"                  },
    ],
    ports_in: ["results", "query"], ports_out: ["reranked"],
  },
  agent_loop: {
    label: "Agent Loop", group: "Agent", icon: "AL",
    color: T.amber, colorBg: "rgba(245,158,11,0.12)",
    fields: [
      { key: "max_iterations", label: "Max Iterations", default: "10"   },
      { key: "stop_condition", label: "Stop Condition", default: "done" },
    ],
    ports_in: ["query", "tools"], ports_out: ["action", "final_answer"],
  },
  tool_caller: {
    label: "Tool Caller", group: "Agent", icon: "TC",
    color: T.amber, colorBg: "rgba(245,158,11,0.12)",
    fields: [{ key: "tools", label: "Tools", default: "search,calculator" }],
    ports_in: ["action"], ports_out: ["result"],
  },
  output: {
    label: "Output", group: "Agent", icon: "OUT",
    color: T.green, colorBg: "rgba(16,185,129,0.12)",
    fields: [{ key: "format", label: "Format", default: "text" }],
    ports_in: ["response"], ports_out: [],
  },
};

const PALETTE_GROUPS = ["Qdrant", "Embeddings", "LLM", "Data", "Agent"];

// ─── CODE GENERATOR ───────────────────────────────────────────────────────────
function generateCode(nodes, edges) {
  if (!nodes.length) return "# Add nodes to generate code";
  const has = (t) => nodes.some((n) => n.type === t);
  const lines = ["# Generated by QdrantFlow\n"];
  if (nodes.some((n) => NODE_DEFS[n.type]?.isQdrant))
    lines.push("from qdrant_client import QdrantClient, models");
  if (has("openai_embed") || has("openai_llm")) lines.push("from openai import OpenAI");
  if (has("cohere_embed") || has("cohere_llm")) lines.push("from cohere import Client as Cohere");
  if (has("anthropic_llm")) lines.push("from anthropic import Anthropic");
  if (has("fastembed")) lines.push("from fastembed import TextEmbedding");
  if (has("reranker")) lines.push("import cohere");
  lines.push("");

  // Topological Sort
  const adj = new Map();
  const inDegree = new Map();
  nodes.forEach(n => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  edges.forEach(e => {
    if (adj.has(e.from) && adj.has(e.to)) {
      adj.get(e.from).push(e.to);
      inDegree.set(e.to, inDegree.get(e.to) + 1);
    }
  });

  const queue = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sortedNodes = [];
  while (queue.length > 0) {
    const u = queue.shift();
    sortedNodes.push(u);
    adj.get(u).forEach(v => {
      inDegree.set(v, inDegree.get(v) - 1);
      if (inDegree.get(v) === 0) queue.push(v);
    });
  }

  // Append any nodes that might be in a cycle (fallback)
  nodes.forEach(n => {
    if (!sortedNodes.includes(n.id)) sortedNodes.push(n.id);
  });

  sortedNodes.forEach((nodeId) => {
    const n = nodes.find(node => node.id === nodeId);
    const f = n.fields;
    switch (n.type) {
      case "qdrant_collection":
        lines.push(`# Qdrant client — ${f.collection}`);
        lines.push(`client = QdrantClient("${f.host}")`);
        lines.push(`client.recreate_collection(`);
        lines.push(`    collection_name="${f.collection}",`);
        lines.push(`    vectors_config=models.VectorParams(`);
        lines.push(`        size=${f.vector_size}, distance=models.Distance.COSINE`);
        lines.push(`    )`);
        lines.push(`)`);
        break;
      case "qdrant_search":
        lines.push(`# Vector search`);
        lines.push(`collection_name = "${f.collection}"  # Ensure collection_name is defined or retrieved from edges`);
        lines.push(`results = client.query_points(`);
        lines.push(`    collection_name=collection_name,`);
        lines.push(`    query=vectors[0] if 'vectors' in locals() else [], # Placeholder query`);
        lines.push(`    limit=${f.top_k},`);
        lines.push(`    score_threshold=${f.score_threshold}`);
        lines.push(`)`);
        break;
      case "qdrant_hybrid":
        lines.push(`# Hybrid search — dense + sparse (${f.fusion} fusion)`);
        lines.push(`collection_name = "${f.collection}"`);
        lines.push(`results = client.query_points(`);
        lines.push(`    collection_name=collection_name,`);
        lines.push(`    prefetch=[`);
        lines.push(`        models.Prefetch(query=vectors[0] if 'vectors' in locals() else [], using="dense", limit=${f.top_k}),`);
        lines.push(`        models.Prefetch(query=sparse_vectors[0] if 'sparse_vectors' in locals() else [], using="${f.sparse_model}", limit=${f.top_k}),`);
        lines.push(`    ],`);
        lines.push(`    query=models.FusionQuery(fusion=models.Fusion.${f.fusion}),`);
        lines.push(`    limit=${f.top_k}`);
        lines.push(`)`);
        break;
      case "qdrant_upsert":
        lines.push(`# Batch upsert`);
        lines.push(`collection_name = "${f.collection}"`);
        lines.push(`client.upload_points(`);
        lines.push(`    collection_name=collection_name,`);
        lines.push(`    points=[models.PointStruct(id=i, vector=v, payload=p)`);
        lines.push(`            for i, (v, p) in enumerate(zip(vectors if 'vectors' in locals() else [], payloads if 'payloads' in locals() else []))],`);
        lines.push(`    batch_size=${f.batch_size}`);
        lines.push(`)`);
        break;
      case "qdrant_filter":
        lines.push(`# Payload filter`);
        lines.push(`filter_cond = models.Filter(`);
        lines.push(`    ${f.condition}=[models.FieldCondition(key="${f.field}", match=models.MatchValue(value="${f.match}"))]`);
        lines.push(`)`);
        break;
      case "openai_embed":
        lines.push(`# OpenAI embeddings`);
        lines.push(`oai = OpenAI()`);
        lines.push(`resp = oai.embeddings.create(model="${f.model}", input=texts)`);
        lines.push(`vectors = [r.embedding for r in resp.data]`);
        break;
      case "cohere_embed":
        lines.push(`# Cohere embeddings`);
        lines.push(`co = Cohere(api_key=os.environ["COHERE_API_KEY"])`);
        lines.push(`resp = co.embed(texts=texts, model="${f.model}", input_type="${f.input_type}")`);
        lines.push(`vectors = resp.embeddings`);
        break;
      case "fastembed":
        lines.push(`# FastEmbed (local, no API key)`);
        lines.push(`embedder = TextEmbedding(model_name="${f.model}")`);
        lines.push(`vectors = list(embedder.embed(texts))`);
        break;
      case "anthropic_llm":
        lines.push(`# Claude generation`);
        lines.push(`client_an = Anthropic()`);
        lines.push(`response = client_an.messages.create(`);
        lines.push(`    model="${f.model}",`);
        lines.push(`    max_tokens=${f.max_tokens},`);
        lines.push(`    messages=[{"role": "user", "content": prompt}]`);
        lines.push(`)`);
        lines.push(`answer = response.content[0].text`);
        break;
      case "openai_llm":
        lines.push(`# GPT generation`);
        lines.push(`oai_chat = OpenAI()`);
        lines.push(`response = oai_chat.chat.completions.create(`);
        lines.push(`    model="${f.model}", temperature=${f.temperature},`);
        lines.push(`    messages=[{"role": "user", "content": prompt}]`);
        lines.push(`)`);
        lines.push(`answer = response.choices[0].message.content`);
        break;
      case "cohere_llm":
        lines.push(`# Command R+ generation`);
        lines.push(`co_chat = Cohere(api_key=os.environ["COHERE_API_KEY"])`);
        lines.push(`response = co_chat.chat(model="${f.model}", message=prompt, documents=documents)`);
        lines.push(`answer = response.text`);
        break;
      case "reranker":
        lines.push(`# Rerank results`);
        lines.push(`co_rerank = cohere.Client(api_key=os.environ["COHERE_API_KEY"])`);
        lines.push(`reranked = co_rerank.rerank(`);
        lines.push(`    model="${f.model}", query=query, documents=[r.payload["text"] for r in results], top_n=${f.top_n}`);
        lines.push(`)`);
        break;
      case "doc_loader":
        lines.push(`# Load documents from ${f.source}`);
        lines.push(`from pathlib import Path`);
        lines.push(`exts = {".${f.format.split(",").map(s => s.trim()).join('", ".')}"}`);
        lines.push(`docs = [p.read_text() for p in Path("${f.source}").rglob("*") if p.suffix in exts]`);
        break;
      case "chunker":
        lines.push(`# Chunk text — size=${f.chunk_size}, overlap=${f.overlap}`);
        lines.push(`def chunk(text, size=${f.chunk_size}, overlap=${f.overlap}):`);
        lines.push(`    step = size - overlap`);
        lines.push(`    return [text[i:i+size] for i in range(0, len(text), step)]`);
        lines.push(`chunks = [c for doc in docs for c in chunk(doc)]`);
        break;
      case "query_input":
        lines.push(`${f.variable} = input("Query: ")`);
        break;
      case "agent_loop":
        lines.push(`# Agentic loop — max ${f.max_iterations} iterations`);
        lines.push(`for step in range(${f.max_iterations}):`);
        lines.push(`    action = llm.decide(memory=qdrant_memory, query=query)`);
        lines.push(`    if action["type"] == "${f.stop_condition}": break`);
        lines.push(`    result = tools.call(action)`);
        break;
      case "tool_caller":
        lines.push(`# Tool dispatch`);
        lines.push(`TOOLS = {t.strip(): globals()[t.strip()] for t in "${f.tools}".split(",")}`);
        lines.push(`result = TOOLS[action["tool"]](**action["args"])`);
        break;
      case "output":
        lines.push(`# Output`);
        lines.push(`print(answer)`);
        break;
      default: break;
    }
    lines.push("");
  });
  return lines.join("\n");
}

// ─── QDRANT LOGO ─────────────────────────────────────────────────────────────
function QdrantLogo({ size = 28 }) {
  // Faithful recreation of the Qdrant geometric mark:
  // three rhombuses forming an isometric cube (top · left · right faces)
  const s = size;
  const cx = s / 2, cy = s / 2;
  // Six vertices of the enclosing hexagon
  const top   = [cx,          cy - s * 0.42];
  const tl    = [cx - s * 0.4, cy - s * 0.14];
  const tr    = [cx + s * 0.4, cy - s * 0.14];
  const bl    = [cx - s * 0.4, cy + s * 0.14];
  const br    = [cx + s * 0.4, cy + s * 0.14];
  const bot   = [cx,          cy + s * 0.42];
  const mid   = [cx,          cy];

  const pt = (pts) => pts.map((p) => p.join(",")).join(" ");

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ flexShrink: 0 }}>
      {/* top face */}
      <polygon points={pt([top, tr, mid, tl])} fill={T.accent} />
      {/* left face */}
      <polygon points={pt([tl, mid, bot, bl])} fill="rgba(230,57,70,0.55)" />
      {/* right face */}
      <polygon points={pt([mid, tr, br, bot])} fill="rgba(230,57,70,0.75)" />
      {/* inner edge lines for definition */}
      <line x1={mid[0]} y1={mid[1]} x2={top[0]} y2={top[1]} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      <line x1={mid[0]} y1={mid[1]} x2={bl[0]}  y2={bl[1]}  stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      <line x1={mid[0]} y1={mid[1]} x2={br[0]}  y2={br[1]}  stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
    </svg>
  );
}

// ─── PORT COMPONENT ───────────────────────────────────────────────────────────
function Port({ nodeId, portName, direction, onStart, onEnd }) {
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

// ─── FLOW NODE ────────────────────────────────────────────────────────────────
function FlowNode({ node, selected, onSelect, onDelete, onDuplicate, onDragStart, onPortStart, onPortEnd, onFieldChange }) {
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

// ─── EDGE SVG ─────────────────────────────────────────────────────────────────
function getPortCenter(nodeId, portName, direction, canvasId = "qf-canvas") {
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

function EdgeLayer({ edges, onDeleteEdge, tempEdge }) {
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

// ─── PALETTE ITEM ─────────────────────────────────────────────────────────────
function PaletteItem({ type, def, onDragStart }) {
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

// ─── PROPS PANEL ─────────────────────────────────────────────────────────────
function PropsPanel({ node, onFieldChange }) {
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

// ─── CODE PANEL ──────────────────────────────────────────────────────────────
function CodePanel({ code }) {
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

// ─── MINIMAP ─────────────────────────────────────────────────────────────────
function Minimap({ nodes, pan, scale, canvasW, canvasH }) {
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

// ─── SETTINGS MODAL ──────────────────────────────────────────────────────────
function SettingsModal({ apiKey, onSave, onClose }) {
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

// ─── SAVE/LOAD MODAL ─────────────────────────────────────────────────────────
function SaveLoadModal({ nodes, edges, onLoad, onClose }) {
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
  const edgesRef     = useRef(edges);
  const draggingRef  = useRef(null);
  const dragOffset   = useRef({ x: 0, y: 0 });
  const connectRef   = useRef(null);
  const palDragType  = useRef(null);
  const isPanning    = useRef(false);
  const panStart     = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const canvasSizeRef = useRef({ w: 800, h: 600 });

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
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
  const code = useMemo(() => generateCode(nodes, edges), [nodes, edges]);

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
    setNodes((prev) => { const next = [...prev, node]; pushHistory(prev, edgesRef.current); return next; });
  };

  const deleteNode = (id) => {
    setNodes((prev) => { const next = prev.filter((n) => n.id !== id); pushHistory(prev, edgesRef.current); return next; });
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Syne', 'Segoe UI', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }
        .palette-item:hover { background: ${T.surf2} !important; border-color: ${T.border} !important; }
        .port-dot:hover { border-color: ${T.indigo} !important; background: ${T.indigo} !important; transform: scale(1.3); }
        .chip:hover { border-color: ${T.accent} !important; color: ${T.text} !important; }
        input, textarea { font-family: 'Syne', 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: `1px solid ${T.border}`, background: T.surf, flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em" }}>
          <QdrantLogo size={26} />
          <span style={{ color: T.accent }}>Qdrant</span>FLOW
        </div>
        <div style={{ width: 1, height: 18, background: T.border }} />

        {/* Zoom controls */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <button onClick={() => setScale((s) => Math.max(0.25, +(s - 0.1).toFixed(2)))}
            style={btnStyle}>−</button>
          <span style={{ fontSize: 10, color: T.text3, width: 38, textAlign: "center", fontFamily: "monospace" }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)))}
            style={btnStyle}>+</button>
          <button onClick={fitView} style={{ ...btnStyle, marginLeft: 2 }} title="Fit view (F)">⊡</button>
          <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} style={btnStyle} title="Reset view">↺</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.text3 }}>{nodes.length}N · {edges.length}E</span>
          <button onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)" style={{ ...btnStyle, opacity: history.length ? 1 : 0.4 }}>↩</button>
          <button onClick={() => setShowSaveLoad(true)} style={btnStyle} title="Save/Load (Ctrl+S)">⎘ Save</button>
          <button onClick={() => setShowSettings(true)} style={btnStyle}>⚙</button>
          <button onClick={clearAll} style={{ ...btnStyle, color: T.accent }}>Clear</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── PALETTE ── */}
        <div style={{ width: 195, background: T.surf, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              placeholder="Search nodes…"
              style={{ width: "100%", background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 11, color: T.text, outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = T.indigo}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 6px 10px" }}>
            {paletteSearch ? (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase", padding: "4px 10px", marginBottom: 4 }}>Results</div>
                {filteredPalette.map(([type, def]) => (
                  <PaletteItem key={type} type={type} def={def} onDragStart={onPalDragStart} />
                ))}
                {!filteredPalette.length && <div style={{ fontSize: 11, color: T.text3, padding: "8px 10px" }}>No nodes found</div>}
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
