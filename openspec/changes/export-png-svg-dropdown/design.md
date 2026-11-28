## Context

The Neko Model playground currently contains header action buttons: "Copiar Código", "Exportar .nkm", and "Exportar SVG". The user requested adding a PNG export option and consolidating SVG and PNG into a single dropdown list.

## Goals / Non-Goals

**Goals:**
- Provide a unified, responsive dropdown in the header ("Exportar Imagem ▾" / "Export Image ▾").
- Allow the user to select either "Exportar SVG" or "Exportar PNG".
- Render PNGs at high fidelity (2x resolution) using standard browser Canvas rendering with white or transparent background according to theme.
- Support internationalization for Portuguese and English.

**Non-Goals:**
- Exporting to PDF or other formats (can be added later).
- Adding server-side image rendering (remains 100% client-side).

## Decisions

1. **Dropdown UI Structure**:
   - Use a clean dropdown component matching the existing header styling (`.btn-primary` or custom dropdown menu).
   - Alternatively, a styled `<select>` or split button that resets its value after triggering download so the user can easily re-export the same format or pick another.
   - We will implement a custom dropdown menu or styled select that triggers the appropriate export function upon selection.

2. **Client-side PNG Conversion**:
   - Serialize the rendered `<svg>` element via `XMLSerializer`.
   - Create an SVG Blob and `createObjectURL`.
   - Load into an `HTMLImageElement`.
   - Render onto an in-memory `HTMLCanvasElement` sized to `svg.viewBox.baseVal` or `getBoundingClientRect()`, scaled by `devicePixelRatio` (or 2.0x for crisp retina output).
   - Export via `canvas.toBlob(...)` and trigger download using an `<a>` element with `download="diagrama.png"`.

## Risks / Trade-offs

- **External Font/Styles Rendering in Canvas**:
  - *Risk*: Sometimes SVG text rendered to Canvas loses external web fonts if not embedded.
  - *Mitigation*: Neko Model uses system fonts (`sans-serif`, `var(--font-mono)`) and standard SVG styling attributes (`fill`, `font-size`, `font-family`) directly on text elements, ensuring accurate rendering across all major browsers.
