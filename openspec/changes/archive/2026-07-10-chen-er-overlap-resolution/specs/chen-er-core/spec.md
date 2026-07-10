## ADDED Requirements

### Requirement: Bounding Box Overlap Resolution
The layout engine SHALL resolve any bounding box overlaps between core nodes (entities, relationships, specializations) in the final diagram.

#### Scenario: Resolving collision between disjoint branches
- **WHEN** two core nodes (e.g. `Has` and `Manager`) have overlapping coordinate boundaries
- **THEN** the layout engine SHALL push the rightmost node and its connected sub-graph horizontally to the right until a minimum margin of $35\text{px}$ is achieved between their boundaries.
