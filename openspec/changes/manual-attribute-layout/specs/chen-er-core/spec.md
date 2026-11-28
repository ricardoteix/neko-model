## ADDED Requirements

### Requirement: Manual Attribute Layout Mode
The layout engine SHALL support the configuration `attribute_layout manual` (and Portuguese `layout_atributos manual`), positioning attributes with an `offset` metadata vector directly relative to the parent element's center, and attributes with a `pos` metadata property at absolute coordinates.

#### Scenario: Placing an attribute using relative offset in manual mode
- **WHEN** `attribute_layout manual` is configured and an entity at `(200, 300)` has an attribute with `[offset: 40, -60]`
- **THEN** the layout engine positions the attribute center at `x = 240, y = 240`, independent of other attributes or incident connection angles.

#### Scenario: Placing an attribute using absolute pos in manual mode
- **WHEN** `attribute_layout manual` is configured and an attribute has `[pos: 350, 420]`
- **THEN** the layout engine positions the attribute center at `x = 350, y = 420`.

#### Scenario: Fallback dynamic placement for unpositioned attributes in manual mode
- **WHEN** an attribute in manual mode does not have an `offset` or `pos` specified
- **THEN** the layout engine places the attribute in an available angular gap using dynamic boundary clearance.
