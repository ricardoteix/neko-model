## ADDED Requirements

### Requirement: Coordinate Metadata Parsing
The parser SHALL parse coordinate metadata enclosed in brackets `[pos: X, Y]` immediately following any entity, weak_entity, relationship, identifying_relationship, or specialization declaration.

#### Scenario: Parsing entity position
- **WHEN** the DSL string contains `entity Customer [pos: 120, 250]`
- **THEN** the parser extracts `{ x: 120, y: 250 }` and assigns it to the entity's position override in the AST.

### Requirement: AST Representation
The AST nodes for entities, relationships, and specializations SHALL contain an optional `pos` property representing manual coordinates.

#### Scenario: Inspecting AST structure
- **WHEN** an AST is generated for a positioned entity
- **THEN** the node object contains a `pos` field with numerical properties `x` and `y`.

### Requirement: Bidirectional AST Stringification
The AST serializer SHALL output brackets metadata `[pos: X, Y]` for any node possessing manual coordinates.

#### Scenario: Serializing positioned nodes
- **WHEN** a node in the AST has position `{ x: 300, y: 400 }`
- **THEN** the serializer outputs the node declaration followed by `[pos: 300, 400]`.
