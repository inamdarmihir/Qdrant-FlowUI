/**
 * Example Custom Node Plugin
 * ─────────────────────────────────────────────────────────────────────────────
 * This file demonstrates how to add a brand-new node type ("my_custom_llm")
 * to QdrantFlow without touching any core source files.
 *
 * To activate this example:
 *   1. Import this file in src/main.jsx BEFORE the app renders:
 *        import "./plugins/example-custom-node";
 *   2. A new "Custom" palette group containing "My Custom LLM" will appear.
 *
 * Copy-paste this pattern to build your own integrations.
 */

import { T } from "../constants/theme";
import { registerNode } from "../constants/nodes";
import { registerImport, registerCodeGenerator } from "../utils/codeGenerator";

// ─── 1. Declare the node ─────────────────────────────────────────────────────
registerNode("my_custom_llm", {
  label:   "My Custom LLM",
  group:   "Custom",           // Creates a new palette group automatically
  icon:    "MC",               // Up to 3 chars, shown in the badge
  color:   T.purple,
  colorBg: "rgba(168,85,247,0.12)",
  fields: [
    { key: "endpoint", label: "API Endpoint", default: "https://api.example.com/v1" },
    { key: "model",    label: "Model",        default: "my-model-v1"                },
    { key: "api_key",  label: "API Key Env",  default: "MY_LLM_API_KEY"            },
  ],
  ports_in:  ["context", "query"],
  ports_out: ["response"],
});

// ─── 2. Register the Python import that the node needs ───────────────────────
registerImport("my_custom_llm", "import requests  # pip install requests");

// ─── 3. Register the code generator for the node ─────────────────────────────
// `lines` is the shared array of Python source lines — push to it.
// `fields` holds the current field values from the node on the canvas.
registerCodeGenerator("my_custom_llm", (lines, fields) => {
  lines.push(`# My Custom LLM — ${fields.model}`);
  lines.push(`import os`);
  lines.push(`_resp = requests.post(`);
  lines.push(`    f"${fields.endpoint}/chat",`);
  lines.push(`    headers={"Authorization": f"Bearer {os.environ['${fields.api_key}']}"}, `);
  lines.push(`    json={"model": "${fields.model}", "messages": [{"role": "user", "content": prompt}]}`);
  lines.push(`)`);
  lines.push(`answer = _resp.json()["choices"][0]["message"]["content"]`);
});
