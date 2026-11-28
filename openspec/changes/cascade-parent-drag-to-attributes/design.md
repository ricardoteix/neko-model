## Context

In `playground/app.ts`, when dragging begins on mousedown, `draggedNodes` is populated only with elements explicitly in `selectedIds`. When an entity is dragged, its attributes are not in `selectedIds`, so they do not receive SVG transforms during mousemove.

## Goals / Non-Goals

**Goals:**
- Automatically collect all descendant attribute node groups when initializing a drag on a parent entity or relationship.
- Include these satellite nodes in the `draggedNodes` translation loop during `mousemove`.
- Update line tracking so edges between dragged parents and their satellites are marked `isInternal: true`, moving both endpoints rigidly.
- Maintain single attribute drag isolation: dragging an attribute directly only moves that attribute.

**Non-Goals:**
- Moving connected relationships when an entity moves (relationships are not satellites, they are connected nodes and lines between them should stretch).

## Decisions

1. **Satellite Collection on Drag Start**:
   - For every node in `selectedIds` that is not an attribute (i.e., entities, relationships):
   - Traverse its attributes in the AST and collect their qualified IDs (`${parentId}_attr_${attrId}`) and composite children (`${attrId}_child_${childId}`).
   - Add these satellite nodes to `draggedNodes` (marked as satellite/descendant) if not already explicitly added.
   - Pass the expanded set of IDs to `storeInitialConnectedLineCoordinatesForSelection`.

2. **Line Rigid Translation**:
   - Because both the parent and attribute node IDs are in the expanded dragged set, `edges.forEach` naturally identifies the connector line as `isInternal = true`.
   - Both `(x1, y1)` and `(x2, y2)` translate by `(currentDx, currentDy)`, eliminating the stretching artifact.

3. **Mouseup Handling**:
   - For satellites with relative offsets: they do not need offset recomputation because their parent moved by `(dx, dy)` and relative offset didn't change.
   - For satellites with absolute `pos`: update `attr.pos = { x: snapVal(dn.initialX + currentDx), y: snapVal(dn.initialY + currentDy) }`.

## Risks / Trade-offs

- **Deduplication in Multi-select**:
  - *Risk*: An attribute could be selected directly AND its parent is also selected.
  - *Mitigation*: Use a `Set` to ensure each SVG group is added to `draggedNodes` at most once.
