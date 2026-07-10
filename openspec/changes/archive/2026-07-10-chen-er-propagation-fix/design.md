# Design: Shift Propagation directed flow

## Decisions

### Decision 1: Directed-Only BFS Traversal
- **Traversal**: In `shiftSubGraph`, the loop only adds `edge.to` to the queue when `edge.from === currId`.
- **Impact**: Prevents back-propagation (child -> parent shifts), which isolates displacement to the specific branch containing the overlap. This resolves the empty space issue and prevents infinite loop oscillations.

### Decision 2: Specialization Subclass Connection Flow
- **Flow**: Subclass edges are added as `from: spec.id` (circle) and `to: sub` (subclass).
- **Impact**: Aligns specialization subclass links with the downward hierarchy, allowing superclass -> circle -> subclass directed propagation to function correctly.
