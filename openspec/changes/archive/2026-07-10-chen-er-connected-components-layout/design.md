# Design: Connected Components Layout Isolation

## Decisions

### Decision 1: Adjacency Grouping
- **Algorithm**: Group core nodes (excluding attributes) into connected components using an undirected BFS search over `edges`.
- **Sorting**: Sort components by their minimum original x-coordinate to preserve Dagre's natural left-to-right relative component ordering.

### Decision 2: Localized Layout Constraints
- **Scope**: Apply connection directions and overlap resolution locally within each component.
- **Guardrail**: The `shiftSubGraph` propagation is constrained to only visit nodes within the active component (`compSet`).

### Decision 3: Separation Spacing
- **Spacing**: Components are arranged side-by-side with a margin of $80\text{px}$ between their outer bounding boxes.
- **Benefits**: Completely prevents interleaving, overlapping, and connection line crossings between disjoint components.
