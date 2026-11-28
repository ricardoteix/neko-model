## Context

In Chen ER / Neko Model, attributes belong to entities or relationships. In existing attribute spacing modes (`default`, `zigzag`, `classic`), attribute positions are calculated dynamically using radial orbits and incident edge angles. Whenever a new attribute or relationship connection is added, the angular sectors are recomputed, causing previously positioned attributes to shift unpredictably.

To solve this, we are introducing a **Manual** attribute layout mode (`attribute_layout manual` / `layout_atributos manual`), making it the new default.

## Goals / Non-Goals

**Goals:**
- Provide a `manual` attribute layout mode where attribute positions are stable and predictable.
- In `manual` mode, attributes with `[offset: dx, dy]` are placed directly at `(parent.x + dx, parent.y + dy)` relative to the parent center, completely immune to changes in other attributes or connecting relationship lines.
- Support `[pos: X, Y]` on attributes for absolute canvas coordinates.
- Implement the "Dynamic $\rightarrow$ Manual" creation lifecycle: when an attribute is added without coordinates in the visual editor, the system dynamically finds a clear spot and immediately freezes it as a relative `[offset: dx, dy]` in the DSL.
- Moving a parent entity/relationship automatically moves all its relative `offset` attributes in lockstep.
- Retain existing `default` (dynamic), `zigzag`, and `classic` modes for users who prefer full automatic recalculation.

**Non-Goals:**
- Deprecating or removing dynamic, zigzag, or classic modes.
- Complex physics-based manual spring constraints between attributes.

## Decisions

### 1. Manual Mode Geometry: Relative Offset vs. Absolute Position
- **Decision**: 
  - `[offset: dx, dy]` on an attribute represents a vector relative to the center of its parent entity or relationship:
    $$\text{pos}_{\text{attr}} = (\text{parent}.x + dx, \text{parent}.y + dy)$$
  - `[pos: X, Y]` on an attribute represents an absolute position on the canvas.
  - In `manual` mode, if an attribute has an `offset`, the engine skips radial orbit $\theta$ calculations and evaluates this direct vector.
- **Rationale**: Relative `offset` ensures that when an entity is dragged across the canvas, all its attributes move with it as a cohesive unit. Absolute `pos` is available if a user explicitly wants a fixed point on the canvas.

### 2. "Dynamic on Creation $\rightarrow$ Manual Thereafter" Lifecycle
- **Decision**:
  - When a user clicks "+ Atributo" in the inspector or uses the visual Add Attribute tool:
    1. The layout engine identifies available angular gaps around the parent node.
    2. It selects an angle $\theta$ and base radius $r$ clear of parent boundaries and existing attributes.
    3. It calculates $dx = r \cos(\theta)$ and $dy = r \sin(\theta)$.
    4. It assigns `attr.offset = [Math.round(dx), Math.round(dy)]` immediately in the AST.
    5. The serialized DSL outputs `[offset: dx, dy]`.
- **Rationale**: The user gets the best of both worlds: zero manual placement effort when creating new attributes, and absolute stability from then on.

### 3. Graceful Fallback for Legacy / Unpositioned Attributes
- **Decision**: In `manual` mode, if an attribute in the DSL does not have `offset` or `pos`, the layout engine dynamically calculates an orbit position for it as a fallback.
- **Rationale**: Ensures backward compatibility with existing `.nkm` or `chenER` diagrams written without offsets.

## Risks / Trade-offs

- [Risk] Cluttered DSL if many attributes each have `[offset: dx, dy]`.
  → Mitigation: The formatting remains concise: `nome [offset: 0, -85]`. Users can also switch back to `Dynamic` mode to clear all offsets if they want a clean automated layout.
- [Risk] Overlapping attributes if the parent is very small or many attributes are added manually.
  → Mitigation: The initial dynamic placement algorithm ensures new attributes are placed with boundary clearance. Users can drag any attribute freely to adjust spacing.
