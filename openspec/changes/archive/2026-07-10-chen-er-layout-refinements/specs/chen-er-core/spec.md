## ADDED Requirements

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
