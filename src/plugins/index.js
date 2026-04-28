/**
 * QdrantFlow Plugin API
 * ─────────────────────────────────────────────────────────────────────────────
 * Import from this module to extend QdrantFlow with custom nodes.
 *
 * Quick-start
 * -----------
 *   import { registerNode, registerCodeGenerator, registerImport } from "./src/plugins";
 *
 *   registerNode("my_node", { ... });
 *   registerImport("my_node", "import my_library");
 *   registerCodeGenerator("my_node", (lines, fields) => { lines.push(...); });
 *
 * See src/plugins/example-custom-node.js for a fully worked example.
 */

export { registerNode, registerGroup } from "../constants/nodes";
export { registerCodeGenerator, registerImport } from "../utils/codeGenerator";
