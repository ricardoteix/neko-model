# visual-creator Specification

## Purpose
TBD - created by archiving change chen-er-visual-creator. Update Purpose after archive.
## Requirements
### Requirement: Drag-and-Drop Coordinate Update
The visual editor SHALL allow the user to drag any core node on the canvas, updating its `pos` coordinates dynamically.

#### Scenario: Dragging Customer entity
- **WHEN** the user drags the Customer entity node to coordinate `(200, 300)`
- **THEN** the editor SHALL update the DSL representation to include `[pos: 200, 300]` for Customer.

### Requirement: Interactive Connection Creation
The visual editor SHALL allow users to create connection lines by dragging from one node's port handles and dropping onto another node's handles.

#### Scenario: Connecting Customer to Places
- **WHEN** the user drags a line from a Customer port to a Places port
- **THEN** the editor SHALL append `Customer -- Places` to the DSL.

### Requirement: Properties Inspector Updates
The properties inspector panel SHALL display context-sensitive editors for the selected element, including name, primary/partial keys, composite attributes, and specialization disjoint/overlapping types.

#### Scenario: Editing specialization constraints
- **WHEN** the user selects a specialization node and clicks "Overlapping" in the inspector
- **THEN** the editor SHALL change its type to `overlapping` in the DSL and render `'o'` in the center of the triangle.

