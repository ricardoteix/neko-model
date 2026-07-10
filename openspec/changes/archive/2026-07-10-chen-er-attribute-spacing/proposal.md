# Proposal: Advanced Attribute Spacing & Layout Configurations

## Problem

In Chen ER diagrams, entity attributes are placed radially. However, under certain conditions, they can overlap:
1. **Single Connection Entities**: When an entity only has a single relationship, the available angular gap is the full $360^\circ$ ($2\pi$ radians). The current radial engine treats this as a linear interval, placing the first and last attributes right next to the boundary line, resulting in severe overlaps.
2. **Narrow Sectors**: When multiple relationship lines are connected, the angular gaps become small. Squeezing too many attributes into a single orbit layer inside a narrow sector causes horizontal overlapping.
3. **Lack of Layout Choice**: Users should be able to configure whether they want standard dynamic capacity, alternating zig-zag offsets, or classic rendering.

## Solution

We will introduce a new DSL configuration option `attribute_layout <mode>` with three values:
- `default`: Enables per-gap dynamic capacity calculations and perfect $360^\circ$ circle-distribution for single-connection nodes.
- `zigzag`: Extends the `default` mode by alternating the radii of adjacent attributes (adding $+25\text{px}$ to odd elements) to offset their shapes vertically/radially.
- `classic`: Disables dynamic capacity and circle-distribution, reverting to the previous fixed maximum of 3 elements per layer and linear gaps.

## What Changes

- **DSL Grammar & Parser**: Support the config directive `attribute_layout [default|zigzag|classic]`.
- **Layout Math in `src/layout.ts`**:
  - Check if the gap size is $2\pi$ and distribute nodes evenly without margins.
  - Compute orbit layer capacity dynamically: $\text{capacity} = \max\left(1, \left\lfloor \frac{R \cdot \text{gap.size}}{85} \right\rfloor\right)$.
  - Apply $+25\text{px}$ radial offset to odd index attributes if `zigzag` mode is configured.
- **Web Playground integration**: Read the DSL directive to compile the selected layout option dynamically.
