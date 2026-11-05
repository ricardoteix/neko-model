## Why

Users working in the Neko Model playground need a convenient way to download and save their diagram source code locally using the dedicated `.nkm` file extension, facilitating file sharing, offline backup, and external version control.

## What Changes

- Add an "Export .nkm" (or "Save .nkm") button to the playground header action bar.
- Implement an export handler that generates a `.nkm` text file blob containing the current DSL code from the editor and triggers an automatic browser file download.
- Provide a default filename (e.g., `model.nkm` or derived from diagram context) with MIME type `text/plain` or `application/octet-stream`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `visual-creator`: Add file export requirement allowing users to download the active diagram code with `.nkm` extension directly from the UI header.

## Impact

- Playground interface: `playground/index.html` (header button).
- Playground logic: `playground/app.ts` (export event listener and blob download logic).
- Styling (if necessary): `playground/style.css`.
