## ADDED Requirements

### Requirement: Manual Position Overrides
The layout engine SHALL support overriding coordinate placements computed by Dagre for any core node using manually specified positions.

#### Scenario: Placing an entity at custom coordinates
- **WHEN** an entity has a position override `[pos: 150, 220]`
- **THEN** the layout engine SHALL place the entity center exactly at `x = 150`, `y = 220` in the final diagram layout.
