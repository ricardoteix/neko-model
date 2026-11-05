## Why

Exported SVG diagrams (and rendered SVGs with manual node positions) currently have their viewBox hardcoded to start at `0 0`, causing nodes and attributes with negative coordinates (e.g. elements positioned near `(0, 0)` with radiating attributes) to be clipped when viewed in browsers like Edge, Chrome, or in VS Code.

## What Changes

- Add `minX` and `minY` bounding box coordinates to `PositionedGraph` in `src/types.ts`.
- Update `src/layout.ts` to compute accurate `minX`, `minY`, `width`, and `height` considering negative coordinate extents and padding, especially when manual node coordinates are present (`hasAnyManualPos = true`).
- Update `src/renderer.ts` to use dynamic viewBox origin `viewBox="${graph.minX ?? 0} ${graph.minY ?? 0} ${graph.width} ${graph.height}"` so all elements remain within the visible area.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `chen-er-core`: Calculate full bounding box including negative coordinate extents and set the SVG viewBox dynamically based on `minX` and `minY`.

## Impact

- `src/types.ts` (`PositionedGraph` interface)
- `src/layout.ts` (`DagreRadialLayoutEngine` layout calculation)
- `src/renderer.ts` (SVG header `<svg viewBox="...">` generation)
- Unit tests in `src/layout.test.ts` and `src/renderer.test.ts`
