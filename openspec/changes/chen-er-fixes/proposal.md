## Why

Following initial visual testing of the Chen ER Diagram renderer, four usability and notation discrepancies were identified:
1. When an entity has multiple attributes grouped in a single sector, they overlap.
2. When applying a manual offset to a node, connection lines do not follow the node's new position.
3. Generalization/specialization circles do not align with classic database modeling, which represents them as triangles containing participation and constraint shorthand (e.g., `(t, d)`).
4. Text underlines on key attributes can cause visual clutter; a darkened background fill for the key oval provides a cleaner design.

## What Changes

- **Layered Concentric Attribute Orbits**: Update the radial layout engine to place attributes in concentric orbits (concentric rings) if more than 3 attributes are placed in the same angular gap, eliminating overlaps.
- **Edge Offset Calibration**: Shift the starting and ending points of connection lines based on the final, offset-adjusted coordinates of their connected nodes.
- **Triangle Specialization Element**: Replace the specialization circle with a triangle containing shorthand text (e.g. `(t, d)` for total disjoint, `(p, o)` for partial overlapping) and adjust text offsets.
- **Key Attribute Oval Styling**: Remove the underline decoration from key attribute text and instead render the key attribute oval with a distinct, darkened background fill color.
- **Dynamic Attribute Oval Width**: Automatically expand the width of attribute ovals based on the length of their label text to prevent textual overflow.
- **Directed Inheritance Lines**: Add directed arrowheads on lines connecting subclasses to their specialization triangle, pointing towards the triangle.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `chen-er-core`: Refining the parser, radial layout, and SVG rendering engines to support layered attribute positioning, line offsets, triangle specializations, and key fills.

## Impact

- **Core Renderer**: Updates to layout calculations in `src/layout.ts` and SVG rendering in `src/renderer.ts`.
- **CSS Styles**: Additional stylesheet rules and variables defining key attribute fill colors for each theme.
