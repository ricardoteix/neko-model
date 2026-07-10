# Design: Connection Layout Directions

## Decisions

### Decision 1: Sub-graph Shifter (BFS)
- **Algorithm**: A BFS traversal shifts the target node and all connected core nodes (excluding the source node) by the offset `(dx, dy)`.
- **Exclusion**: We do not shift attribute nodes in this step, as they are positioned relative to their parent nodes during the subsequent `placeAttributes` phase.

### Decision 2: Spacing Constants
- **Horizontal spacing**: `fromNode.width/2 + toNode.width/2 + 100` pixels.
- **Vertical spacing**: `fromNode.height/2 + toNode.height/2 + 80` pixels.
- **Rationale**: Provides clear visual separation while keeping nodes close enough to maintain short connections.

### Decision 3: Phase Ordering
- **Order**: Connection direction constraints are applied after Dagre positions the core nodes but before `placeAttributes` runs. This ensures satellites (attributes) are placed correctly around the final shifted centers of the core nodes.
