## Context

The Neko Model playground currently supports exporting diagrams as `.nkm` files via the "Exportar .nkm" button. However, there is no corresponding "Abrir" or "Importar" button to load `.nkm` files back into the workspace. Users need a simple, intuitive way to load their saved models.

## Goals / Non-Goals

**Goals:**
- Provide an "Abrir .nkm" / "Open .nkm" action button in the playground header.
- Allow file selection via native file picker dialog accepting `.nkm` (and fallback `.txt`).
- Allow drag-and-drop of `.nkm` files directly over the code editor panel.
- Update the editor title badge (`#editor-file-name`) with the name of the opened file.
- Recompile the diagram immediately upon loading, reset or push to undo/redo history, and provide graceful error alerts if the file cannot be read.
- Localize button and tooltip text for Portuguese and English.

**Non-Goals:**
- Cloud file storage or server-side file management (all processing remains 100% client-side in the browser).

## Decisions

1. **File Input Strategy**:
   - Add a hidden `<input type="file" id="input-open-nkm" accept=".nkm,.txt" style="display: none;" />`.
   - The visible button `#btn-open-nkm` triggers `input.click()`.
   - On `input.onchange`, check `files[0]`, read text via `file.text()` (standard Promise API available in all modern browsers).
   - Reset `input.value = ""` after loading so the user can re-open the same file again if desired.

2. **Drag-and-Drop Enhancement**:
   - Add `dragover` and `drop` event listeners to `#editor-panel`.
   - On `drop`, prevent default, extract `e.dataTransfer.files[0]`, read and load into the editor.

## Risks / Trade-offs

- **Invalid File Content**:
  - *Risk*: A user opens a corrupted or non-DSL file.
  - *Mitigation*: The text is loaded into the editor and `compileDiagram()` runs inside its existing `try / catch`, displaying the parser error message in the error footer without crashing the app.
