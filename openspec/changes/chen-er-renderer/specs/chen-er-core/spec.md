## ADDED Requirements

### Requirement: DSL Parsing
The engine SHALL parse a Chen ER diagram DSL string into a structured Abstract Syntax Tree (AST) representing all entities, relationships, attributes, connections, specialization hierarchies, configuration options, styling overrides, and coordinate offsets.

#### Scenario: Parse Valid DSL
- **WHEN** the input string is a valid Chen ER diagram specification containing an entity with attributes and a relationship
- **THEN** the parser returns a structured AST detailing the entities, relationships, attributes, and their connections

### Requirement: Modular Layout Selection
The system SHALL support selecting and running different layout engines dynamically via the configuration, allowing layout algorithms to be swapped (e.g., between default dagre-radial and force-directed).

#### Scenario: Load Custom Layout Engine
- **WHEN** the configuration option `layout` is set to `force`
- **THEN** the layout manager invokes the force-directed layout engine instead of the default hybrid dagre-radial layout engine

### Requirement: Radial Attribute Layout
The default layout engine SHALL place attribute nodes in a radial formation surrounding their parent entity or relationship node, distributing them evenly within angular sectors that are free of incoming/outgoing relationship connection lines.

#### Scenario: Attributes Positioned in Free Sectors
- **WHEN** an entity has three attributes and is connected to a relationship on its right (0 degrees)
- **THEN** the default layout engine places the attributes on the left, top, and bottom sectors to avoid crossing the relationship line

### Requirement: Element Offsets
The layout engine SHALL apply custom X and Y coordinate offsets defined in the DSL to adjust the final position of nodes, attributes, and relationship/connection labels relative to their auto-layout coordinates.

#### Scenario: Attribute Position Shifted
- **WHEN** an attribute is defined with metadata `[offset: -20, 50]`
- **THEN** the engine shifts the attribute's final SVG rendering coordinates by -20 pixels horizontally and 50 pixels vertically from its computed radial position

### Requirement: Interactive SVG Document Generation
The rendering engine SHALL output a valid, scalable SVG document with responsive viewboxes, styled using semantic CSS classes and theme variables that correspond to the chosen theme or CSS overrides.

#### Scenario: Render SVG with Theme variables
- **WHEN** the theme is set to `forest`
- **THEN** the renderer outputs an SVG with root CSS variables containing the forest color palette (green fills, dark borders)
