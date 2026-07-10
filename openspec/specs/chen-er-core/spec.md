# chen-er-core Specification

## Purpose
TBD - created by archiving change chen-er-attribute-spacing. Update Purpose after archive.
## Requirements
### Requirement: Full-Circle Attribute Distribution
When an entity or relationship has only a single connection, the layout engine SHALL distribute all its attributes evenly across the full $360^\circ$ circle ($2\pi$ radians) without applying edge margins.

#### Scenario: Spacing 3 attributes around a single-connection entity
- **WHEN** an entity has 1 relationship connection and 3 attributes
- **THEN** the layout engine distributes the attributes at $0^\circ$, $120^\circ$, and $240^\circ$ offsets relative to the connection line

### Requirement: Dynamic Orbit Capacity
The layout engine SHALL compute the capacity of each radial orbit layer dynamically based on the angular gap size and current radius to prevent overlapping in narrow sectors.

#### Scenario: Capacity adjusted for narrow gap
- **WHEN** a gap size is $1.0$ radians and the radius is $90\text{px}$
- **THEN** the capacity is calculated as $\lfloor (90 \cdot 1.0) / 85 \rfloor = 1$, placing only 1 attribute in the inner orbit layer

### Requirement: Zigzag Alternating Radii
When the DSL configuration `attribute_layout zigzag` is active, the layout engine SHALL project odd-indexed attributes in the same orbit layer with an additional $+25\text{px}$ radius offset.

#### Scenario: Projecting zigzag attributes
- **WHEN** `attribute_layout zigzag` is active and 3 attributes are placed on a layer of base radius $90\text{px}$
- **THEN** attribute 0 is projected at radius $90\text{px}$, attribute 1 at $115\text{px}$, and attribute 2 at $90\text{px}$

### Requirement: Classic Orbit CAPACITY
When the DSL configuration `attribute_layout classic` is active, the layout engine SHALL revert to placing a fixed maximum of 3 attributes per orbit layer and using linear gap distributions with margins.

#### Scenario: Reverting to classic layout
- **WHEN** `attribute_layout classic` is active and an entity has 5 attributes
- **THEN** 3 attributes are placed in the first orbit layer and 2 in the second orbit layer, regardless of gap size

### Requirement: Boundary Clearance for Attributes
The layout engine SHALL place attribute ovals entirely outside the bounding box of their parent entity or relationship node, maintaining a minimum clearance of 10 pixels between their borders.

#### Scenario: Spacing attribute horizontally next to a wide entity
- **WHEN** an entity of width $140\text{px}$ has a horizontal attribute of width $80\text{px}$
- **THEN** the layout engine places the attribute's center at a distance of at least $70 + 40 + 10 = 120\text{px}$ from the entity's center

### Requirement: Composite Child Attribute Clearance
The layout engine SHALL position child attributes of a composite attribute with an angular and radial spacing sufficient to prevent them from overlapping each other.

#### Scenario: Spacing child attributes of a composite attribute
- **WHEN** a composite attribute has 3 child attributes (each of width $75\text{px}$)
- **THEN** the layout engine places the children at a radius of $80\text{px}$ across an angular spread of $126^\circ$, ensuring their borders do not touch

### Requirement: Enlarged Specialization Node
The layout engine SHALL represent specialization nodes with a bounding box of $80 \times 80$ pixels (adding $15\text{px}$ of padding on all sides relative to the original $50 \times 50$ size).

#### Scenario: Rendering a specialization triangle
- **WHEN** rendering a specialization node in SVG
- **THEN** it has a base width of $80\text{px}$ and a height of $80\text{px}$, and its connection arrow marker points to its border at $40\text{px}$ from center (plus line clearance).

### Requirement: Connection Layout Directions
The parser and layout engine SHALL support configuring layout directions on connection lines using the `dir` bracket metadata.

#### Scenario: Placing a relationship to the right of an entity
- **WHEN** a connection is defined as `Entity -- Relationship [dir: right]`
- **THEN** the layout engine positions the relationship to the right of the entity on the same horizontal line ($y_1 \approx y_2$), maintaining a boundary-to-boundary spacing of at least $100\text{px}$.

### Requirement: Bounding Box Overlap Resolution
The layout engine SHALL resolve any bounding box overlaps between core nodes (entities, relationships, specializations) in the final diagram.

#### Scenario: Resolving collision between disjoint branches
- **WHEN** two core nodes (e.g. `Has` and `Manager`) have overlapping coordinate boundaries
- **THEN** the layout engine SHALL push the rightmost node and its connected sub-graph horizontally to the right until a minimum margin of $35\text{px}$ is achieved between their boundaries.

### Requirement: Downstream Shift Propagation
The layout engine SHALL propagate node position shifts only downstream along the layout flow (from parent to child).

#### Scenario: Pushing a child node
- **WHEN** a child node (e.g. `Item`) is pushed to the right to resolve an overlap
- **THEN** its parent node (e.g. `Has`) and other ancestors (e.g. `Customer`) SHALL NOT be shifted, allowing the connection line between parent and child to stretch.

### Requirement: Disjoint Component Separation
The layout engine SHALL group disconnected sub-graphs (independent connected components) and arrange them in isolated non-overlapping columns in the final layout.

#### Scenario: Rendering disjoint ER branches
- **WHEN** the diagram contains two disjoint graphs (e.g. `Customer-Order` and `Employee`)
- **THEN** the layout engine SHALL position all nodes of the second component entirely to the right of the first component, ensuring a minimum boundary-to-boundary gap of at least $80\text{px}$ is maintained and no lines cross between components.

