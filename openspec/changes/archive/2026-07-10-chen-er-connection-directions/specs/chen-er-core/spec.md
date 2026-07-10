## ADDED Requirements

### Requirement: Connection Layout Directions
The parser and layout engine SHALL support configuring layout directions on connection lines using the `dir` bracket metadata.

#### Scenario: Placing a relationship to the right of an entity
- **WHEN** a connection is defined as `Entity -- Relationship [dir: right]`
- **THEN** the layout engine positions the relationship to the right of the entity on the same horizontal line ($y_1 \approx y_2$), maintaining a boundary-to-boundary spacing of at least $100\text{px}$.
