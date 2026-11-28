## Why

Currently, the Neko Model playground only provides an "Exportar SVG" button. Users frequently need raster images (PNG) to share diagrams on social media, include in slide decks, paste into documentation tools, or display in viewers that don't render standalone SVGs well. Replacing the standalone SVG button with a unified export dropdown allowing users to choose between SVG and PNG provides a clean, consolidated UI while meeting varied export requirements.

## What Changes

- Replace the standalone "Exportar SVG" button with a unified export dropdown (e.g., "Exportar Imagem ▾" / "Export Image ▾").
- Add high-resolution PNG export using an in-memory HTML5 Canvas rasterizer (supporting 2x scale for crisp rendering).
- Preserve existing SVG export capability within the same dropdown selector.
- Update i18n translations (Portuguese and English) for the new dropdown options.

## Capabilities

### New Capabilities
- `image-export`: Unified export dropdown offering both vector SVG and raster PNG downloads for the generated Chen ER diagrams.

### Modified Capabilities
<!-- None -->

## Impact

- **UI / Playground:** `playground/index.html`, `playground/style.css`, `playground/i18n.ts`, and `playground/app.ts`.
- **Core Library (`dist/`):** No impact; the core renderer already outputs standard SVG that can be converted to raster images.
- **Dependencies:** None; uses standard browser HTML5 Canvas and Blob APIs.
