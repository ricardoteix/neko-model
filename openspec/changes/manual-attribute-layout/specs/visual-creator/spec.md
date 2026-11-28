## ADDED Requirements

### Requirement: Manual Attribute Spacing Default
The visual playground SHALL provide "Manual" as an attribute spacing option and SHALL use Manual as the default spacing mode.

#### Scenario: Selecting Manual attribute spacing
- **WHEN** the user opens the playground or selects "Manual" from the Attribute Spacing dropdown
- **THEN** the editor sets the configuration to `attribute_layout manual` in the DSL and updates the rendering accordingly.

### Requirement: Freezing Initial Attribute Placement
When a user adds a new attribute in Manual mode, the editor SHALL calculate a clear orbital position dynamically and immediately persist it as a relative `[offset: dx, dy]` in the AST and serialized DSL.

#### Scenario: Adding an attribute in Manual mode
- **WHEN** the user adds an attribute to an entity in Manual mode
- **THEN** the visual editor assigns a non-zero relative offset `[offset: dx, dy]` clear of the parent element's border, freezing its position from shifting upon subsequent edits.
