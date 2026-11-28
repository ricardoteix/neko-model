## Why

Currently, the visual editor allows selecting multiple elements via `Ctrl + Click`, but when the user drags any node, the selection is either destroyed or only the single clicked node moves. Furthermore, users cannot easily select groups of nodes via a marquee/bounding-box selection tool, and panning the canvas conflicts with background dragging. Users need a professional diagramming workflow (similar to Figma or Miro) where multiple elements can be selected together (via box selection or Ctrl/Shift clicks) and dragged simultaneously while preserving their relative positions, connection lines, and grid snapping.

## What Changes

- **Multi-Element Drag & Translation**: Allow moving all currently selected nodes simultaneously when any node in the selection is dragged.
  - Preserve relative distances between selected nodes.
  - Snap the anchor node (the grabbed node) to the configured grid interval, applying the exact delta to all other selected nodes.
  - Update connection lines in real-time during drag: fully translate internal edges (where both endpoints are selected) and stretch external edges (where only one endpoint is selected).
  - Synchronize all translated positions into the AST and DSL at once on drag end, registering a single atomic undo/redo history entry.
  - Respect entity-attribute hierarchy: moving a selected entity moves its child attributes naturally without double-applying relative offsets.
- **Marquee (Box) Selection**:
  - Dragging across the empty canvas in the "Select" tool draws a translucent selection rectangle.
  - Nodes whose bounding boxes intersect the selection rectangle become selected.
  - Holding `Shift` while dragging the selection rectangle adds intersecting nodes to the existing selection rather than replacing it.
- **Canvas Navigation & Hand Tool**:
  - Add a dedicated "Pan / Hand" (`✋`) tool in the toolbox alongside "Select" (`↖`).
  - Support holding the `Space` bar (or middle mouse button) as a temporary pan shortcut from any tool.
  - In "Select" mode, background dragging initiates marquee selection; in "Pan" mode or while holding `Space`, background dragging pans the viewport.

## Capabilities

### Modified Capabilities
- `visual-creator`: Extend drag-and-drop requirements to support simultaneous multi-element translation, marquee selection box, and hand/pan tool canvas navigation.

## Impact

- `playground/app.ts`: Multi-drag lifecycle handlers, anchor-delta calculations, multi-line live SVG updates, marquee rectangle creation and intersection logic, spacebar pan handler, and toolbox tool state management.
- `playground/index.html` & `playground/style.css`: Add Hand tool button, marquee selection rectangle styles, and cursor styling.
- `src/serializer.ts` & AST synchronization: Multi-node coordinate update batching.
