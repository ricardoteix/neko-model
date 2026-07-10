## ADDED Requirements

### Requirement: Downstream Shift Propagation
The layout engine SHALL propagate node position shifts only downstream along the layout flow (from parent to child).

#### Scenario: Pushing a child node
- **WHEN** a child node (e.g. `Item`) is pushed to the right to resolve an overlap
- **THEN** its parent node (e.g. `Has`) and other ancestors (e.g. `Customer`) SHALL NOT be shifted, allowing the connection line between parent and child to stretch.
