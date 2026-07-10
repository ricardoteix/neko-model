# Design: Bounding Box Overlap Resolution

## Decisions

### Decision 1: Horizontal-Only Right Push
- **Choice**: Overlaps are resolved exclusively by shifting nodes horizontally to the right.
- **Rationale**: Since the main rank layout is vertical (TB), horizontal space is open and infinite. Restricting the push direction to the right avoids infinite loop oscillations (which happen when nodes are pushed back-and-forth between boundaries).

### Decision 2: Propagation
- **Choice**: Call `shiftSubGraph(targetId, referenceId, shiftX, 0)` to propagate the shift downstream.
- **Exclusion**: The reference node is excluded from the propagation.

### Decision 3: Safety Guardrails
- **Limit**: The layout loop is capped at a maximum of 30 iterations.
- **Margin**: The minimum boundary clearance between core nodes is set to $35\text{px}$.
