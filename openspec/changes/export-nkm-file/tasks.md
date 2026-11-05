## 1. Playground Interface

- [x] 1.1 Add the "Export .nkm" button (`#btn-export-nkm`) to the playground header action group in `playground/index.html`.
- [x] 1.2 Verify button styling and layout consistency with existing buttons in `playground/style.css`.

## 2. Export Handler Implementation

- [x] 2.1 Attach click event listener to `#btn-export-nkm` in `playground/app.ts` to create a `Blob` from editor content and trigger download as `model.nkm`.
- [x] 2.2 Revoke object URL after trigger to prevent memory leaks and verify file export behavior.
