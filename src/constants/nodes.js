import { T } from "./theme";

export const NODE_DEFS = {
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

export const PALETTE_GROUPS = ["Qdrant", "Embeddings", "LLM", "Data", "Agent"];
