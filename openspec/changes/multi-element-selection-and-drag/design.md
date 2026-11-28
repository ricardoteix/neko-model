## Context

In the current Chen ER / Neko Model visual editor, multiple nodes can be selected using `Ctrl + Click` (or Cmd on macOS). However, the drag handling system in `playground/app.ts` is strictly 1-to-1:
- A single `dragId` and `dragGroup` are saved on `mousedown`.
- Clicking without `Ctrl` immediately clears all previously selected IDs, destroying multi-selections before a drag can even begin.
- During `mousemove`, only the single `dragGroup` receives an SVG `translate()` transform.
- Only connected lines to `dragId` are tracked, causing distortion if connected elements are moved together.
- On `mouseup`, only `dragId` receives an updated `pos` in the AST.
- Canvas panning is triggered by any mousedown on empty canvas, which prevents implementing a marquee / bounding box drag selection.

## Goals / Non-Goals

**Goals:**
- Enable moving all selected elements simultaneously when dragging any member of the active selection.
- Preserve exact relative distances between all selected elements.
- Use the grabbed node as an "anchor" for grid snapping, applying the calculated delta `(ΔX, ΔY)` uniformly to all selected nodes.
- Accurately translate internal edges (where both endpoints are selected) and stretch external edges (where only one endpoint is selected) during drag.
- Provide a marquee selection box when dragging across empty canvas in "Select" mode.
- Support `Shift + Marquee` to cumulatively add nodes to an existing selection.
- Add a "Hand" (`✋`) tool in the toolbox and a temporary `Spacebar` pan shortcut to seamlessly navigate the canvas.
- Maintain atomic Undo/Redo history for multi-node moves.

**Non-Goals:**
- Free-form polygon lasso selection (rectangular bounding box is standard and sufficient).
- Multi-element rotation or multi-element scaling.
- Grouping nodes into permanent hierarchical compound containers.

## Decisions

### 1. Selection Preservation on Mousedown
- **Decision**: On node `mousedown`:
  - If the clicked node is **already** in `selectedIds` and `Ctrl` is not pressed, do **not** clear the selection. Instead, keep the current selection and treat the clicked node as the `anchorId` for group dragging.
  - If the clicked node is not in `selectedIds` and `Ctrl` is not pressed, clear previous selection and select the clicked node.
  - If `Ctrl` is pressed, toggle selection of the clicked node.
- **Rationale**: Follows standard desktop graphics conventions (Figma, Miro, Illustrator).

### 2. Group Dragging with Anchor Snap
- **Decision**: Track initial positions of all `selectedIds`:
  ```typescript
  interface DragSnapshot {
    anchorId: string;
    nodePositions: Map<string, { x: number; y: number; group: SVGGElement; type: string; parent?: string }>;
    edges: Array<{
      element: SVGLineElement;
      from: string;
      to: string;
      x1: number; y1: number; x2: number; y2: number;
      isInternal: boolean;
    }>;
    texts: Array<{
      element: SVGTextElement;
      edgeFrom: string;
      edgeTo: string;
      x: number; y: number;
      isInternal: boolean;
    }>;
  }
  ```
  - During `mousemove`, compute the anchor's raw position, snap it to the grid interval, and calculate `deltaX = snappedAnchorX - initialAnchorX` and `deltaY = snappedAnchorY - initialAnchorY`.
  - Apply `translate(deltaX, deltaY)` to all groups in `nodePositions`.
- **Alternatives considered**: Snapping each node independently to the grid during drag. *Rejected* because independent snapping alters relative distances and distorts user layouts.

### 3. Edge Live Preview Handling
- **Decision**:
  - If both `from` and `to` are in `selectedIds` (**internal edge**): translate both `(x1, y1)` and `(x2, y2)` by `(deltaX, deltaY)`. The text label translates by `(deltaX, deltaY)`.
  - If only `from` or only `to` is in `selectedIds` (**external edge**): translate only the endpoint matching the selected node. The text label translates by `(deltaX / 2, deltaY / 2)`.

### 4. Attribute vs. Entity Hierarchy
- **Decision**:
  - If an entity/relationship is selected, all its child attributes are moved automatically by updating the parent's `pos`. Child attributes with `selectedIds` whose parent is also in `selectedIds` will not have their relative `offset` altered.
  - If only an attribute is selected (without its parent), update its relative `offset = [initialOffset[0] + deltaX, initialOffset[1] + deltaY]`.

### 5. Canvas Navigation & Marquee Mode Separation
- **Decision**:
  - Active tool state: `"select" | "pan" | "entity" | "relationship" | "specialization" | "attribute"`.
  - In `"select"` tool:
    - Mousedown on canvas background starts Marquee Selection (`<rect class="selection-marquee">`).
    - In `mousemove`, update rect `x, y, width, height` in SVG coordinates.
    - Test intersection with bounding boxes of all diagram nodes.
    - If `Shift` is held, union new intersections with existing `selectedIds`.
  - In `"pan"` tool OR when `Spacebar` is held:
    - Background dragging pans the viewport (`panX`, `panY`).
    - Cursor changes to `grab` / `grabbing`.

## Risks / Trade-offs

- [Risk] Performance when dragging large numbers of nodes and edges simultaneously.
  → Mitigation: Manipulate SVG DOM attributes (`transform`, `x1/y1`) directly during drag without re-parsing or re-rendering entire layout until `mouseup`.
- [Risk] Conflict between Marquee dragging and viewport panning.
  → Mitigation: Clear tool separation (Select vs Hand) plus intuitive `Spacebar` modifier key familiar to all design tool users.
