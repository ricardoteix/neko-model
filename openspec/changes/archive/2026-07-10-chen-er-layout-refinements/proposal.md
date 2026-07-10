# Proposal: Layout & Spacing Refinements

## Problem
1. **Parent-Attribute Overlap**: Since entities and relationships have rectangular/polygonal shapes (e.g. width 140 for entities), placing attributes at a fixed radial distance (e.g. 90px) causes attributes placed horizontally to overlap with the entity borders.
2. **Composite Attribute Overlap**: Composite child attributes (like `street`, `city`, `zip`) are placed at a narrow radius (55px) and angular spread (90°), which causes them to cluster and overlap each other.

## Solution
1. **Dynamic Parent Radius Projection**: Calculate the physical boundary distance of the parent node at the attribute's specific angle, and project the attribute outwards from that boundary with a margin.
2. **Expanded Composite Child Spacing**: Increase the composite child radius from 55px to 80px, and expand the angular spread from 90° to 126° (0.7π rad) to prevent child attributes from overlapping.

## What Changes
- **Layout Math in `src/layout.ts`**:
  - Implement a helper `getParentRadiusAtAngle(node, angle)` that projects a ray from the node center to its border.
  - Calculate `baseRadius = parentBorderRadius + attrWidth / 2 + 10` for each attribute.
  - Update child attribute placement variables: `childRadius = 80` and `sizeAngle = Math.PI * 0.7`.
