## ADDED Requirements

### Requirement: Dynamic SVG ViewBox Bounding Box
The layout and rendering engines SHALL calculate the minimum (`minX`, `minY`) and maximum (`maxX`, `maxY`) coordinate bounds across all nodes, attributes, and child attributes, and configure the SVG `viewBox` using these bounds so that elements with negative or offset coordinates are never clipped.

#### Scenario: Diagram containing attributes with negative coordinates
- **WHEN** an entity has manual or layout coordinates near `(0, 0)` causing surrounding attributes to have negative coordinates (e.g. `x = -90` or `y = -70`)
- **THEN** the layout engine SHALL set `minX` and `minY` incorporating margin padding (e.g. `minX <= -90 - padding` and `minY <= -70 - padding`)
- **AND** the SVG renderer SHALL emit `viewBox="${graph.minX} ${graph.minY} ${graph.width} ${graph.height}"` encompassing all elements.
