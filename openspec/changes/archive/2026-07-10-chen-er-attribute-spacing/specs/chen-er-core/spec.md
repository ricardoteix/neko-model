## ADDED Requirements

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
