<div align="center">

# 🔷 QdrantFlow

**A visual, AI-assisted pipeline builder for [Qdrant](https://qdrant.tech) — drag, connect, generate, and export production-ready Python code.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC244C?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDktNXYtNWwtOSA1LTktNXoiLz48L3N2Zz4=&logoColor=white)](https://qdrant.tech/)
[![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

<br/>

*Build RAG pipelines, semantic search, and agentic systems — visually.*

<br/>

![QdrantFlow UI](https://raw.githubusercontent.com/inamdarmihir/Qdrant-FlowUI/main/preview.png)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Example Pipelines](#-example-pipelines)
- [Node Reference](#-node-reference)
- [🔌 Plugin / Custom Nodes](#-plugin--custom-nodes)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

QdrantFlow is a node-based flow editor for composing AI pipelines centered around the Qdrant vector database. No boilerplate — just drag, connect, and export.

| Capability | Description |
|---|---|
| 🖱️ **Drag & drop** | Add nodes from the palette onto the canvas |
| 🔗 **Visual wiring** | Connect ports between nodes to express data flow |
| ✏️ **Inline editing** | Edit fields directly on each node or in the Properties panel |
| 🤖 **AI generation** | Describe a pipeline in plain English and let Claude build it |
| 🐍 **Code export** | Export production-ready Python from any graph in one click |
| 💾 **Save / load** | Persist named pipelines to `localStorage` or as JSON files |
| 🔌 **Plugin API** | Register custom node types without touching core source files |

---

## 🚀 Getting Started

### Prerequisites

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Anthropic](https://img.shields.io/badge/Anthropic_API_Key-For%20AI%20generation-D97757?style=flat-square)](https://console.anthropic.com/)

### Run locally

```bash
git clone https://github.com/inamdarmihir/Qdrant-FlowUI.git
cd Qdrant-FlowUI
npm install
npm run dev
```

Opens at **http://localhost:5173**

### Build for production

```bash
npm run build   # outputs to dist/
```

### Set your API key

Click **⚙ Settings** in the top-right and paste your Anthropic API key. It is stored only in your browser's `localStorage` and never sent anywhere except the Anthropic API.

---

## 📖 Usage

### Building a pipeline manually

1. **Drag** a node from the left palette onto the canvas
2. **Click a field value** directly on the node (or use the Properties panel) to edit it
3. **Connect ports** — click and drag from an output port (right side) to an input port (left side) of another node
4. **View generated Python** in the Code panel on the right
5. **Download** as `qdrant_pipeline.py` with the ↓ button

### AI generation

Type a description in the prompt bar at the bottom and press **Enter**:

```
RAG pipeline with hybrid search using Qdrant and Claude
Agentic loop with Qdrant memory and tool use
Document ingestion with OpenAI embeddings into Qdrant
```

The canvas is populated automatically and fit to view.

### ⌨️ Keyboard shortcuts

| Key | Action |
|---|---|
| `Del` / `Backspace` | Delete selected node |
| `Escape` | Deselect |
| `Ctrl + Z` | Undo |
| `Ctrl + D` | Duplicate selected node |
| `Ctrl + S` | Open Save / Load dialog |
| `F` | Fit all nodes in view |
| `Scroll` | Zoom in / out |
| `Alt + Drag` | Pan canvas |
| `Middle-click + Drag` | Pan canvas |

---

## 🗺️ Example Pipelines

### Basic RAG
```
Query Input → OpenAI Embed → Qdrant Search → Claude → Output
                                   ↑
                            Qdrant Collection
```

### Hybrid Search RAG
```
Query Input → OpenAI Embed ──▶ Qdrant Hybrid Search → Reranker → Claude → Output
           → FastEmbed ────▶          ↑
                               Qdrant Collection
```

### Agentic Loop
```
Query Input → Agent Loop → Tool Caller → (result back to Agent Loop)
                    ↓
               Qdrant Search (memory)
                    ↓
                 Output
```

---

## 📦 Node Reference

### Qdrant

| Node | Inputs | Outputs | Key Fields |
|---|---|---|---|
| **Collection** | — | `vectors` | host, collection name, vector size |
| **Vector Search** | `query_vector`, `collection` | `results` | top_k, score_threshold |
| **Hybrid Search** | `dense_vector`, `sparse_vector`, `collection` | `results` | top_k, fusion (RRF/DBSF), sparse model |
| **Upsert Points** | `vectors`, `payloads`, `collection` | `status` | batch_size |
| **Filter** | `results` | `filtered` | field, match value, condition |

### Embeddings

| Node | Inputs | Outputs | Key Fields |
|---|---|---|---|
| **OpenAI Embed** | `text` | `vector` | model, dims |
| **Cohere Embed** | `text` | `vector` | model, input_type |
| **FastEmbed** | `text` | `vector` | model (local, no API key) |

### LLM

| Node | Inputs | Outputs | Key Fields |
|---|---|---|---|
| **Claude** | `context`, `query` | `response` | model, max_tokens |
| **GPT-4o** | `context`, `query` | `response` | model, temperature |
| **Command R+** | `documents`, `query` | `response` | model, temperature |

### Data

| Node | Inputs | Outputs | Key Fields |
|---|---|---|---|
| **Doc Loader** | — | `documents` | source path, formats |
| **Chunker** | `documents` | `chunks` | chunk_size, overlap |
| **Query Input** | — | `query` | variable name |
| **Reranker** | `results`, `query` | `reranked` | model, top_n |

### Agent

| Node | Inputs | Outputs | Key Fields |
|---|---|---|---|
| **Agent Loop** | `query`, `tools` | `action`, `final_answer` | max_iterations, stop_condition |
| **Tool Caller** | `action` | `result` | tools list |
| **Output** | `response` | — | format |

---

## 🔌 Plugin / Custom Nodes

You can add entirely new node types — with their own palette entry, field definitions, and Python code generation — **without modifying any core file**.

### Quick-start (3 steps)

**1 — Create your plugin file** (e.g. `src/plugins/my-llm.js`):

```js
import { T } from "../constants/theme";
import { registerNode } from "../constants/nodes";
import { registerImport, registerCodeGenerator } from "../utils/codeGenerator";

// Step 1 — declare the node shape
registerNode("my_llm", {
  label:   "My LLM",
  group:   "Custom",           // creates a new palette group if it doesn't exist
  icon:    "ML",
  color:   T.purple,
  colorBg: "rgba(168,85,247,0.12)",
  fields: [
    { key: "endpoint", label: "Endpoint", default: "https://api.example.com/v1" },
    { key: "model",    label: "Model",    default: "my-model-v1"                },
  ],
  ports_in:  ["context", "query"],
  ports_out: ["response"],
});

// Step 2 — register the Python import
registerImport("my_llm", "import requests");

// Step 3 — register the Python code generator
registerCodeGenerator("my_llm", (lines, fields) => {
  lines.push(`# My LLM — ${fields.model}`);
  lines.push(`response = requests.post("${fields.endpoint}/chat", json={"model": "${fields.model}"})`);
  lines.push(`answer = response.json()["choices"][0]["message"]["content"]`);
});
```

**2 — Import it in `src/main.jsx`** before the app renders:

```js
// src/main.jsx
import "./plugins/my-llm";          // ← add this line
import React from "react";
import ReactDOM from "react-dom/client";
import QdrantFlow from "./QdrantFlow.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QdrantFlow />
  </React.StrictMode>
);
```

**3 — Done!** Your node appears in the palette under the "Custom" group.

### Plugin API reference

| Export | Module | Description |
|---|---|---|
| `registerNode(type, def)` | `src/plugins` | Add a node type to the canvas and palette |
| `registerGroup(name)` | `src/plugins` | Pre-create a palette group |
| `registerImport(type, line)` | `src/plugins` | Emit a Python import for this node type |
| `registerCodeGenerator(type, fn)` | `src/plugins` | Generate Python code for this node type |

All four exports are also available individually from `src/constants/nodes` and `src/utils/codeGenerator`.

A fully worked example is at **[`src/plugins/example-custom-node.js`](src/plugins/example-custom-node.js)**.

---

## 🏗️ Architecture

### Component Tree

```
QdrantFlow (root)
├── Header
│   ├── QdrantLogo          — SVG isometric cube mark
│   └── Toolbar             — zoom, undo, save/load, settings
├── Palette
│   ├── Search input
│   └── PaletteItem[]       — draggable node entries grouped by category
├── Canvas
│   ├── Grid overlay        — CSS background dot/line grid, scales with zoom
│   ├── Transformed layer   — pan + scale via CSS transform
│   │   └── FlowNode[]      — absolutely positioned, draggable nodes
│   ├── EdgeLayer (SVG)     — bezier curves drawn over node layer in screen space
│   ├── Minimap             — SVG thumbnail of all nodes + viewport rect
│   └── PromptBar           — AI generation textarea + send button
├── RightPanel
│   ├── PropsPanel          — editable fields for the selected node
│   └── CodePanel           — syntax-highlighted Python + copy/download
├── StatusBar
├── SettingsModal           — Anthropic API key (persisted to localStorage)
└── SaveLoadModal           — named save slots, JSON import/export
```

### State Model

| State | Type | Description |
|---|---|---|
| `nodes` | `Node[]` | All nodes on canvas (id, type, x, y, fields) |
| `edges` | `Edge[]` | Connections between node ports (from/to node + port) |
| `selectedId` | `string` | Currently selected node id |
| `pan` | `{x, y}` | Canvas translation in pixels |
| `scale` | `number` | Canvas zoom factor (0.25 – 2.5) |
| `history` | `Snapshot[]` | Undo stack (up to 30 states of nodes + edges) |
| `apiKey` | `string` | Anthropic API key (localStorage) |

### Data Flow

```
User types prompt
      │
      ▼
Claude API (claude-sonnet-4-6)
      │  returns JSON {nodes[], edges[]}
      ▼
setNodes / setEdges
      │
      ▼
FlowNode renders (positioned via node.x, node.y)
      │
      ▼
EdgeLayer polls port DOM positions every 60 ms
      │  getPortCenter() → getBoundingClientRect() − canvas origin
      ▼
SVG bezier curves drawn in screen space over canvas
      │
      ▼
generateCode(nodes) → Python string (memo)
      │
      ▼
CodePanel renders syntax-highlighted output
```

### Canvas Coordinate System

```
Screen space:  raw pixel position in the browser viewport
Canvas space:  screen position relative to the canvas element's top-left
Node space:    logical position stored in node.x / node.y

Conversion:
  node_space → canvas_space:   canvas_pos = node.x * scale + pan.x
  canvas_space → node_space:   node_pos   = (canvas_pos − pan) / scale

Zoom is applied at the cursor position so the point under the
mouse stays fixed — achieved by adjusting pan on each wheel event.
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | [React](https://react.dev/) | 18.3.1 |
| DOM renderer | [React DOM](https://react.dev/) | 18.3.1 |
| Bundler | [Vite](https://vitejs.dev/) | 5.4.21 |
| Vite React plugin | [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 4.7.0 |
| Styling | Inline styles (zero CSS dependencies) | — |
| AI generation | [Anthropic API](https://www.anthropic.com/) — `claude-sonnet-4-6` | — |
| Persistence | Browser `localStorage` | — |
| Language | JSX / ES2022 | — |

---

## 📁 Project Structure

```
Qdrant-FlowUI/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── CodePanel.jsx
│   │   ├── EdgeLayer.jsx
│   │   ├── FlowNode.jsx
│   │   ├── Minimap.jsx
│   │   ├── PaletteItem.jsx
│   │   ├── Port.jsx
│   │   ├── PropsPanel.jsx
│   │   ├── QdrantLogo.jsx
│   │   ├── SaveLoadModal.jsx
│   │   └── SettingsModal.jsx
│   ├── constants/               # Application constants
│   │   ├── nodes.js             # NODE_DEFS + registerNode() plugin API
│   │   └── theme.js             # Design tokens (colors, etc.)
│   ├── plugins/                 # Plugin / extension entry-points
│   │   ├── index.js             # Public plugin API (re-exports)
│   │   └── example-custom-node.js  # Worked example — copy to create your own
│   ├── utils/                   # Utility functions
│   │   └── codeGenerator.js     # Python code gen + registerCodeGenerator() API
│   ├── QdrantFlow.jsx           # Main application component
│   └── main.jsx                 # React entry point (import plugins here)
├── index.html                   # Vite HTML shell
├── vite.config.js               # Vite configuration
├── package.json
└── .gitignore
```

---

<div align="center">

Built with ❤️ using [Qdrant](https://qdrant.tech/) · [Anthropic Claude](https://www.anthropic.com/) · [React](https://react.dev/) · [Vite](https://vitejs.dev/)

</div>
