# QdrantFlow

A visual, AI-assisted pipeline builder for [Qdrant](https://qdrant.tech). This repository provides a drag-and-drop interface for composing AI pipelines and generating production-ready Python code.

## System Requirements

- Node.js version 18 or higher.
- A modern web browser.
- (Optional) Anthropic API key for AI generation features.

## Installation

To set up the project locally, run the following commands:

```bash
git clone https://github.com/inamdarmihir/Qdrant-FlowUI.git
cd Qdrant-FlowUI
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Architecture

QdrantFlow is a single-page React application leveraging Vite for module bundling.

- **UI Framework:** React 18
- **Bundler:** Vite 5
- **Styling:** Inline CSS
- **Persistence:** Local Storage
- **Code Generation:** AST-based code generation using an explicit topological sort of flow nodes.

## Usage

### Building Pipelines

1. Drag node components from the left palette onto the main canvas.
2. Edit inline properties by clicking directly on node fields.
3. Connect output ports to compatible input ports to establish data flow.
4. Export the resulting directed acyclic graph as a Python script.

### Generating Pipelines via AI

Users can provide a plain text description in the prompt bar to automatically generate a visual pipeline graph via the Anthropic Claude API.

## License

This project is licensed under the MIT License.
