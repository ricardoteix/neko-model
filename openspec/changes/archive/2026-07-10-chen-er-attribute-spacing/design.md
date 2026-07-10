# Design: Advanced Attribute Spacing Configurations

## Decisions

### Decision 1: Full-Circle Detection & Distribution
- **Choice**: When placing attributes around a parent node, if the parent has only 1 connection (or 0), we treat the gap as a full $2\pi$ circle.
- **Formula**: Instead of placing items in a linear interval with margins:
  `angle = gap.start + (2 * Math.PI * j) / layerCount`
  This distributes elements evenly over $360^\circ$ without squeezing the first and last elements together.

### Decision 2: Dynamic Capacity Chunking
- **Choice**: Capacity is calculated per orbit layer. As the orbit pushes outward, the circumference increases, so the outer orbits can hold more elements.
- **Algorithm**:
  We loop through attributes in a gap and assign them to layers. For each layer $L$:
  - Current Radius: $R = R_{base} + L \times 35$.
  - Sector Capacity: $C = \max\left(1, \left\lfloor \frac{R \cdot \text{gap.size}}{85} \right\rfloor\right)$.
  - If the current layer exceeds $C$, we close the layer, increment $L$, and start a new layer at the outer orbit radius.
- **Rationale**: Ensures that narrow sectors only place 1 attribute per orbit (preventing overlapping), while wide sectors can place 6+ attributes.

### Decision 3: Zigzag Radial Offset
- **Choice**: If `attribute_layout zigzag` is active, we apply a secondary offset to consecutive attributes.
- **Formula**: For attribute index $j$ inside its layer:
  - If $j$ is even: $R_{final} = R_{\text{layer}}$.
  - If $j$ is odd: $R_{final} = R_{\text{layer}} + 25\text{px}$.
- **Rationale**: Shifting odd-numbered attributes radially outwards keeps them clear of the horizontal bounds of their even-numbered neighbors.

### Decision 4: DSL Configuration Directive
- **Choice**: Add parsing support for `attribute_layout <mode>` in `parser.ts` where `<mode>` is an identifier.
- **Values**:
  - `default`: Circle-distribution + dynamic capacity.
  - `zigzag`: Circle-distribution + dynamic capacity + alternating radii.
  - `classic`: Reverts to the legacy fixed capacity of 3 and linear gap margins.
- **Default value**: If the config directive is omitted, `default` is used.
