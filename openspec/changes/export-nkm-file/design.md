## Context

The Neko Model playground currently supports copying diagram DSL code to the clipboard and exporting the rendered visual representation as an SVG file. However, users lack a direct one-click action to download and persist their source code as a standalone file using the official `.nkm` extension.

## Goals / Non-Goals

**Goals:**
- Provide a clean, visible action button in the playground header: "Export .nkm".
- Generate a client-side text file download (`model.nkm`) containing the exact contents of the code editor.
- Use standard browser Web APIs (`Blob`, `URL.createObjectURL`, programmatic link click) without adding third-party dependencies.

**Non-Goals:**
- File drag-and-drop or file upload/import into the playground (can be tackled in a separate change).
- Complex file save dialog configurations or server-side persistence.

## Decisions

- **Decision 1: Action location**: Add `#btn-export-nkm` adjacent to `#btn-copy` and `#btn-export-svg` in `playground/index.html`.
  - *Rationale*: Keeps all output and export actions grouped together logically in the top header.
- **Decision 2: Client-side download pattern**: Use `new Blob([editorContent], { type: 'text/plain;charset=utf-8' })` and a temporary hidden `<a>` tag with `download="model.nkm"`.
  - *Rationale*: Lightweight, universally supported in modern browsers, no backend required.
  - *Alternatives considered*: File System Access API (`showSaveFilePicker`). While modern, it requires HTTPS and explicit browser permissions, whereas blob download works seamlessly across all environments.

## Risks / Trade-offs

- [Risk: Object URL memory leak] → *Mitigation*: Call `URL.revokeObjectURL(url)` immediately or inside a `setTimeout` after triggering `.click()`.
- [Risk: Empty editor code download] → *Mitigation*: Allow exporting whatever is in the editor, or provide a default fallback if desired.
