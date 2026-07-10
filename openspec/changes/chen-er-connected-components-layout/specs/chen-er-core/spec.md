## ADDED Requirements

### Requirement: Disjoint Component Separation
The layout engine SHALL group disconnected sub-graphs (independent connected components) and arrange them in isolated non-overlapping columns in the final layout.

#### Scenario: Rendering disjoint ER branches
- **WHEN** the diagram contains two disjoint graphs (e.g. `Customer-Order` and `Employee`)
- **THEN** the layout engine SHALL position all nodes of the second component entirely to the right of the first component, ensuring a minimum boundary-to-boundary gap of at least $80\text{px}$ is maintained and no lines cross between components.
