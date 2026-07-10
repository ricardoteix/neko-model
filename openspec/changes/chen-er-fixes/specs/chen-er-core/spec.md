## MODIFIED Requirements

### Requirement: Radial Attribute Layout
The default layout engine SHALL place attribute nodes in a radial formation surrounding their parent entity or relationship node, distributing them in concentric orbits (with a maximum of 3 attributes per orbit layer per sector) to ensure that attributes do not overlap each other.

#### Scenario: Attributes Positioned in Concentric Rings
- **WHEN** an entity has 5 attributes allocated to a single free angular sector
- **THEN** the default layout engine places the first 3 attributes in the inner orbit layer and the remaining 2 attributes in an outer concentric orbit layer

### Requirement: Element Offsets
The layout engine SHALL apply custom X and Y coordinate offsets defined in the DSL to adjust the final position of nodes, attributes, and relationship/connection labels relative to their auto-layout coordinates, and SHALL update all connected line endpoints to align with the nodes' offset positions.

#### Scenario: Connection Line Follows Offset Node
- **WHEN** a node is shifted by an offset `[offset: 50, -30]`
- **THEN** all connection lines leading to or from that node have their endpoints translated by 50 pixels horizontally and -30 pixels vertically

## ADDED Requirements

### Requirement: Triangle Specialization Element
The rendering engine SHALL represent disjoint and overlapping generalization/specialization elements as an upward-pointing triangle containing text representing the participation constraints and the constraint type (e.g. `(t, d)` for total disjoint or `(p, o)` for partial overlapping).

#### Scenario: Render Total Disjoint Specialization
- **WHEN** a specialization is defined with `type: disjoint` and `participation: total`
- **THEN** the renderer outputs an SVG polygon forming a triangle and centers the text label `(t, d)` inside it

### Requirement: Key Attribute Styling
The rendering engine SHALL style primary key attribute ovals with a darkened background fill color and standard bold text, and SHALL NOT apply underlines to the key text.

#### Scenario: Render Key Attribute with Darkened Oval
- **WHEN** an attribute has the `key` modifier
- **THEN** the renderer applies the key fill color class to the SVG ellipse and renders the text bold without text underline decoration

### Requirement: Dynamic Attribute Oval Width
The layout engine SHALL compute the width of attribute ovals dynamically based on the character length of their label text to prevent textual overflow.

#### Scenario: Width Scaled for Long Attribute Name
- **WHEN** an attribute has a name of 15 characters
- **THEN** the layout engine sets its width to a value greater than 100 pixels

### Requirement: Directed Subclass Connections
The rendering engine SHALL draw connection lines from subclasses pointing to their specialization triangle with a directed arrowhead.

#### Scenario: Render Directed Connection Line
- **WHEN** a connection leads from a subclass to a specialization triangle
- **THEN** the line renders with an SVG arrow marker ending at the border of the specialization triangle
