<div align="center">

# 🔷 QdrantFlow

**A visual, AI-assisted pipeline builder for [Qdrant](https://qdrant.tech) — drag, connect, generate, and export production-ready Python code.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC244C?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDktNXYtNWwtOSA1LTktNXoiLz48L3N2Zz4=&logoColor=white)](https://qdrant.tech/)
[![Anthropic](https://img.shields.io/badge/Powered%20by-Claude-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

<br/>

*Build RAG pipelines, semantic search, and agentic systems — visually.*

<br/>

![QdrantFlow UI](https://raw.githubusercontent.com/inamdarmihir/Qdrant-FlowUI/main/preview.png)

</div>

---

## Overview

QdrantFlow is a node-based flow editor for composing AI pipelines centered around the Qdrant vector database. No boilerplate — just drag, connect, and export.

| Capability | Description |
|---|---|
| 🖱️ **Drag & drop** | Add nodes from the palette onto the canvas |
| 🔗 **Visual wiring** | Connect ports between nodes to express data flow |
| ✏️ **Inline editing** | Edit fields directly on each node or in the Properties panel |
| 🤖 **AI generation** | Describe a pipeline in plain English and let Claude build it |
| 🐍 **Code export** | Export production-ready Python from any graph in one click |
| 💾 **Save / load** | Persist named pipelines to `localStorage` or as JSON files |

---

## Getting Started

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

### Set your API key

Click **⚙ Settings** in the top-right and paste your Anthropic API key. It is stored only in your browser's `localStorage` and never sent anywhere except the Anthropic API.

---

## Usage

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

### Keyboard shortcuts

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

## Example Pipelines

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

## Node Reference

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

## Architecture

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

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 |
| Bundler | Vite 5 |
| Styling | Inline styles (zero CSS dependencies) |
| AI generation | Anthropic API — `claude-sonnet-4-6` |
| Persistence | Browser `localStorage` |
| Language | JSX (single component file) |

---

## Project Structure

```
Qdrant-FlowUI/
├── QdrantFlow.jsx      # Entire application — all components in one file
├── src/
│   └── main.jsx        # React entry point
├── index.html          # Vite HTML shell
├── vite.config.js      # Vite configuration
├── package.json
└── .gitignore
```

---

<div align="center">

Built with ❤️ using [Qdrant](https://qdrant.tech/) · [Anthropic Claude](https://www.anthropic.com/) · [React](https://react.dev/) · [Vite](https://vitejs.dev/)

</div>
