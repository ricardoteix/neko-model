## Context

The Chen ER SVG diagram generator produces a top-level `<svg>` element with a `viewBox` attribute. Currently, this attribute is hardcoded to `viewBox="0 0 ${graph.width} ${graph.height}"`. When diagrams use manual positioning (`[pos: x, y]`) near the canvas origin, radiating attributes can extend into negative coordinate space (e.g., `x = -109`, `y = -70`). As a result, opening the exported SVG in external viewers (Edge, VS Code, Inkscape, Chrome) causes elements in negative space to be clipped.

## Goals / Non-Goals

**Goals:**
- Include `minX` and `minY` properties in `PositionedGraph` to expose the computed top-left coordinate bounds of the diagram.
- Ensure the layout engine computes accurate bounding boxes for all nodes and attributes, subtracting a symmetric padding buffer to form the `minX` and `minY` coordinates and computing `width = (maxX - minX) + 2 * padding` and `height = (maxY - minY) + 2 * padding`.
- Update the SVG renderer to use `viewBox="${graph.minX ?? 0} ${graph.minY ?? 0} ${graph.width} ${graph.height}"`.
- Ensure backwards compatibility with automated (non-manual) layout behavior.

**Non-Goals:**
- Shifting manual DSL coordinates: the user's explicit coordinates `[pos: X, Y]` in the DSL must remain intact without unintended translation mutations.

## Decisions

- **Decision 1: Expose `minX` and `minY` on `PositionedGraph`**:
  - *Rationale*: Allows `layoutDiagram` to communicate the exact bounding box origin to callers (`render`, playground zoom/viewport wrappers, tests) without breaking existing consumers of `width` and `height`.
- **Decision 2: Dynamic viewBox origin in `renderer.ts`**:
  - *Rationale*: SVG `viewBox` naturally supports negative or non-zero origins `<min-x> <min-y> <width> <height>`. Setting this directly avoids shifting node coordinates, keeping coordinates synchronized 1:1 between the DSL, SVG elements, and mouse interactions.

## Risks / Trade-offs

- [Risk: Playground interactive matrix translation] → *Mitigation*: Ensure `wrapSVGViewport()` and mouse drag handlers in `playground/app.ts` work seamlessly with non-zero viewBox values (which `getScreenCTM().inverse()` natively handles).
