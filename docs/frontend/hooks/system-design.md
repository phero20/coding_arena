# React Hooks: System Design

The `system-design/` directory contains helper hooks and builders specifically for the Excalidraw and AI chat integrations.

## Files

- **`useChat.ts`**: The core AI Assistant hook. It manages the message history, streaming responses from the Bedrock/Claude backend, and parsing markdown into UI components.
- **`builders.ts`**: Helper functions to programmatically construct Excalidraw elements (like specific cloud architecture icons) so the AI can inject shapes into the user's canvas.
- **`canvasGraph.ts`**: Functions to serialize the current state of the canvas into a parseable graph format that the AI can understand (so the AI "sees" the diagram).
- **`handleCreate.ts` / `handleUpdate.ts`**: Utilities for parsing AI instructions (e.g., JSON actions like `ADD_DATABASE`) into actual Excalidraw canvas mutations.
- **`layout.ts`**: Contains algorithms to auto-layout the canvas (e.g., organizing messy shapes into a clean architecture grid).
- **`utils.ts`**: General math and coordinate helpers.
- **`constants.ts`**: Fixed sizes, colors, and configuration settings for the shapes.
