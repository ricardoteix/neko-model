## Why

When dragging an entity or relationship on the playground canvas, its attached attributes (and composite child attributes) remain stationary at their original positions during `mousemove`, while the parent node moves away and connector lines stretch. Only upon `mouseup` do the attributes suddenly snap to their new positions around the parent. This visual lag breaks direct manipulation intuition. Dragging a parent node should move its entire satellite cluster in lockstep in real-time.

## What Changes

- When a parent node (entity or relationship) is dragged, all its attached attribute nodes (and composite sub-attributes) are included in the real-time visual drag translation (`transform="translate(dx, dy)"`).
- The connector edges between the parent and its attributes, as well as composite parent-child edges, are tracked as internal lines so they move rigidly in block without stretching.
- When an attribute is dragged individually by clicking directly on it, only that attribute moves (the parent remains stationary).
- In multi-selection, attributes attached to dragged parents are deduplicated so they are not translated more than once.
- On `mouseup`, any attribute with absolute `[pos: X, Y]` attached to a moved parent has its `pos` updated by `(dx, dy)`, while relative offset attributes stay synchronized naturally.

## Capabilities

### New Capabilities
- `canvas-drag-cascade`: Real-time synchronous translation of attached attributes and connector lines when dragging parent nodes.

### Modified Capabilities
<!-- None -->

## Impact

- **UI / Canvas Interaction:** `playground/app.ts` (`mousedown`, `mousemove`, `mouseup`, and edge tracking functions).
- **Core Library (`dist/`):** None; layout engine and renderer already support the underlying coordinates.
