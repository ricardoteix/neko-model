## ADDED Requirements

### Requirement: Attribute Position Metadata
The parser, AST, and serializer SHALL support coordinate metadata `[pos: X, Y]` on attribute declarations in addition to entities, relationships, and specializations.

#### Scenario: Parsing attribute with absolute pos
- **WHEN** the DSL contains `email [pos: 180, 290]` within an entity block
- **THEN** the parser extracts `{ x: 180, y: 290 }` into the attribute's `pos` property in the AST.

#### Scenario: Serializing attribute with absolute pos
- **WHEN** an attribute in the AST has `pos: { x: 180, y: 290 }`
- **THEN** the serializer outputs the attribute declaration followed by `[pos: 180, 290]`.
