## Why

The playground allows users to export diagram definitions as `.nkm` files, but provides no mechanism to re-open or import previously saved files. Users currently have to open the file outside the browser, copy its content, and paste it manually into the editor. Adding a dedicated "Abrir .nkm" / "Open .nkm" action completes the document lifecycle, allowing seamless saving and loading of model files.

## What Changes

- Add an "Abrir .nkm" / "Open .nkm" button in the playground header next to "Exportar .nkm".
- Add an invisible `<input type="file" id="input-open-nkm" accept=".nkm,.txt" />` to trigger the native file selection dialog.
- Read file content using the Web File API (`file.text()` / `FileReader`) and load it into the CodeMirror editor.
- Update the editor panel file name display (`#editor-file-name`) to reflect the imported file's name.
- Automatically compile and render the newly loaded diagram, updating undo/redo history.
- Add drag-and-drop file loading support over the code editor panel.
- Add i18n translations for "Abrir .nkm" in Portuguese and "Open .nkm" in English.

## Capabilities

### New Capabilities
- `file-import`: Ability to open, import, and drag-and-drop `.nkm` files directly into the playground editor.

### Modified Capabilities
<!-- None -->

## Impact

- **UI / Playground:** `playground/index.html`, `playground/app.ts`, `playground/i18n.ts`.
- **Core Library (`dist/`):** None; the core library remains unchanged.
