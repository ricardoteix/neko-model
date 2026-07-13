## Context

The Chen ER playground currently only supports code-to-visual rendering. To build a full visual creator, we need to bridge visual drag-and-drop operations with the underlying AST and regenerate the DSL text dynamically.

## Goals / Non-Goals

**Goals:**
- Enable drag-and-drop node editing.
- Persist node coordinates back into the DSL using bracket metadata `[pos: X, Y]`.
- Provide a toolbox to place new Entities, Relationships, and Specializations.
- Provide a Properties Inspector to modify selected nodes (cardinality, weak/key attributes, specialization constraints).

**Non-Goals:**
- Layout coordinates for attributes (attributes continue to Orbit radially around their core parent node).
- Visual formatting customizations (fonts, borders, colors) outside the standard theme selectors.

## Decisions

### Decision 1: Interactive SVG Group Wrappers
- **Choice**: Embed custom interactive attributes (`class="core-node"`, `data-node-id="Customer"`, etc.) directly into SVG `<g>` groups in the renderer.
- **Rationale**: Keeps the rendering pipeline simple. The preview canvas and exported SVG remain identical, using standard CSS/JS for drag-and-drop and connection ports.

### Decision 2: DSL coordinate persistence via `[pos: X, Y]`
- **Choice**: Extend the parser to accept bracket overrides `[pos: X, Y]` on declarations, and add a `stringifyAST` generator.
- **Rationale**: Preserves manual layouts between sessions and makes diagrams completely shareable via text snippet copy-pasting.

### Decision 3: Skip Dagre positioning for overrides
- **Choice**: Nodes with custom coordinates bypass Dagre coordinate placement and are placed exactly at their override positions.
- **Rationale**: Gives users absolute visual control over node locations while letting unplaced nodes fall back to Dagre layout.

## Risks / Trade-offs

- **[Risk]** Large diagrams dragging nodes causing lag. → **[Mitigation]** Throttle/debounce the `stringifyAST` and compilation trigger on dragging, only regenerating the full DSL upon mouse release.
