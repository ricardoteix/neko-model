## ADDED Requirements

### Requirement: Real-time Synchronous Translation of Attributes with Parent
When dragging an entity or relationship, all attached attribute nodes and connector lines SHALL move synchronously in real-time during mouse movement.

#### Scenario: Dragging an entity moves all its attributes
- **WHEN** user clicks and drags an entity with attached attributes
- **THEN** all attached attribute nodes translate by the exact same `(dx, dy)` during `mousemove`
- **THEN** connector lines between the entity and its attributes move rigidly without stretching

#### Scenario: Dragging an attribute individually
- **WHEN** user clicks and drags an attribute node directly
- **THEN** only that attribute moves during `mousemove`
- **THEN** the parent entity and other sibling attributes remain stationary

#### Scenario: Multi-selection with parents and attributes
- **WHEN** multiple entities with attributes are selected and dragged together
- **THEN** all entities and all their attached attributes move in unison
- **THEN** no node receives duplicate transform translations

#### Scenario: Persistence on mouseup
- **WHEN** the mouse button is released after dragging an entity
- **THEN** the entity's position is saved
- **THEN** relative attributes maintain their relative offsets
- **THEN** attributes with absolute `pos` have their coordinates shifted by `(dx, dy)`
