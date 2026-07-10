# Design: Layout & Spacing Refinements

## Decisions

### Decision 1: Boundary Projection Math
- **Formula**: For a parent node rectangle with width $W$ and height $H$, the distance $D$ from the center to the border at a given angle $\theta$ is computed by projecting a ray:
  $$D(\theta) = \min\left( \frac{W/2}{|\cos\theta|}, \frac{H/2}{|\sin\theta|} \right)$$
- **Attribute Base Radius**: 
  $$R_{base} = D(\theta) + \frac{\text{attrWidth}}{2} + 10$$
  This positions the attribute oval exactly 10 pixels clear of the parent border.

### Decision 2: Estimated Capacity Radius
- **Choice**: During the capacity checking phase, we estimate the base capacity radius using the average dimensions of the parent node:
  $$R_{\text{capacity\_base}} = \frac{W/2 + H/2}{2} + 50$$
  For a $140 \times 60$ entity, this gives $100\text{px}$, matching our established capacity spacing.

### Decision 3: Expanded Composite Child Spacing Constants
- **Choice**: Modify composite child layout settings:
  - `childRadius = 80` (increased from 55)
  - `sizeAngle = Math.PI * 0.7` (spread of 126°, increased from 90°)
- **Rationale**: Spreading children across a wider arc at a larger radius increases center-to-center Euclidean distance beyond the sum of their radii ($75\text{px}$), resolving overlaps.
