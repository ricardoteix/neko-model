# Design: Specialization Node Padding Refinement

## Decisions

### Decision 1: Enlarged Bounding Box
- **Choice**: Rescale specialization nodes to $80 \times 80\text{px}$.
- **Vertices**:
  - Top: $(x, y - 40)$
  - Bottom-Right: $(x + 40, y + 40)$
  - Bottom-Left: $(x - 40, y + 40)$

### Decision 2: Visual Center of Text Label
- **Centroid**: The centroid of the triangle with these coordinates is at $y_c = y + 13.33$.
- **Offset**: Set text y coordinate to `y + 12` to visually center the text.

### Decision 3: Arrowhead Marker Adjustment
- **Value**: Set `<marker id="chen-arrow" ... refX="42">`.
- **Rationale**: Since the radius of the node bounding box is now $40\text{px}$, setting `refX` to `42` places the arrowhead precisely on the border of the triangle, avoiding line penetration.
