## Context

This design addresses four technical enhancements to the layout, line projection, shape rendering, and styling of Chen ER diagrams:
1. **Attribute Overlapping**: Large numbers of attributes grouped in a single sector overlap. We will implement concentric, multi-layered orbit rings (orbits).
2. **Disconnected Edge Lines**: Connection lines connect to layout-computed coordinates before node offsets are applied. We will recalibrate line endpoints using the final offset-adjusted node coordinates.
3. **Specialization Symbols**: Replace circles with triangles containing shorthand constraint descriptions (e.g., `(t, d)`).
4. **Primary Key Styling**: Use a darkened oval background fill instead of standard text underlining.

## Goals / Non-Goals

**Goals:**
- Eliminate overlapping attributes by routing them in concentric layers of max 3 elements per layer.
- Ensure all connection lines correctly track and follow offset-adjusted entities/relationships.
- Render specializations as clean triangles containing participation/disjointness info.
- Implement theme-specific key attribute background fills without underlines.

**Non-Goals:**
- Creating custom path bends for attributes (attributes continue to connect to their parent in straight lines).
- Supporting custom shapes for attributes other than standard/double/dashed/darkened ovals.

## Decisions

### Decision 1: Concentric Orbit Math
- **Formula**: For a set of attributes allocated to a gap of size $S$, we group them into orbit layers of maximum size 3.
  - For attribute index $j$ (0-indexed) in the gap:
    - Layer index: $L = \lfloor j / 3 \rfloor$.
    - Index inside layer: $idx = j \pmod 3$.
    - Number of attributes in layer $L$: $C_L = \min(3, N_{gap} - L \times 3)$.
    - Radius for layer $L$: $R_L = R_{base} + L \times 35$.
  - Within layer $L$, the $C_L$ attributes are spaced evenly inside the usable gap angular sector and projected at distance $R_L$.
- **Rationale**: This limits the maximum density per orbit to 3 attributes, preventing overlap by automatically layering high-degree attributes in concentric outer rings.

### Decision 2: Edge Endpoint Calibration
- **Choice**: Re-project all edge endpoints after applying node offsets.
- **Rationale**: After laying out nodes and applying offsets, we loop through the positioned edges. For every edge from `A` to `B`, we read `A.x, A.y` and `B.x, B.y` from the `nodes` Map (which already contains offset adjustments) and set the edge's starting and ending points to match.
- **Alternative**: Applying offsets directly to intermediate edge points. This is unnecessarily complex, since Chen ER connections are straight lines from node center to node center.

### Decision 3: Specialization Triangles
- **Choice**: Render specializations as an upward-pointing triangle using an SVG polygon.
  - Coordinate points: `points="${x},${y - 25}  ${x + 25},${y + 25}  ${x - 25},${y + 25}"` (bounds: $50 \times 50$ pixels).
  - Centroid Text Shift: Since the centroid of a triangle sits lower than the vertical midpoint, we shift the text element y-coordinate to $y + 8$ to look centered.
  - Shorthand label: `(${participation === 'total' ? 't' : 'p'}, ${type === 'overlapping' ? 'o' : 'd'})`.

### Decision 4: Key Attribute Fills and Theme CSS Variables
- **Choice**: Introduce `--chen-attribute-key-fill` in CSS stylesheets.
- **Color mappings**:
  - `default`: fill `#c5e1a5` (darker soft green-grey, boundary stroke `#558b2f`).
  - `dark`: fill `#4a148c` (dark purple, boundary stroke `#b388ff`).
  - `forest`: fill `#f0e68c` (khaki yellow, boundary stroke `#fbc02d`).
  - `neutral`: fill `#e0e0e0` (light grey, boundary stroke `#000000`).
- **Rendering**: Style key attribute ellipses with class `.chen-attribute-key` and remove underline decorations.

### Decision 5: Dynamic Attribute Widths
- **Formula**: Compute width dynamically as a function of the text character length:
  `width = Math.max(80, label.length * 8 + 15)` for normal attributes.
  `width = Math.max(75, child.id.length * 7.5 + 15)` for composite children.
- **Rationale**: Replaces hardcoded 80px attribute widths, scaling the oval proportionally to fit long strings without text overflow.

### Decision 6: Directed Subclass Arrows
- **Choice**: Reverse the direction of subclass edges in the layout (drawn from subclass to specialization triangle) and apply an SVG arrow marker ending on the target:
  - Define `<marker id="chen-arrow">` in SVG `<defs>` with `refX="27"` to seat the arrowhead perfectly on the triangle boundary.
  - Apply `marker-end="url(#chen-arrow)"` on all edges targeting specialization nodes.
- **Rationale**: Avoids manual arrowhead coordinate math, relying on SVG's built-in `marker` path alignment.

## Risks / Trade-offs

- **[Risk] Concentric orbits growing too large** → *Mitigation*: The 35px orbit spacing keeps attributes compact while still providing plenty of clearance. Highly complex entities will naturally look clean.
