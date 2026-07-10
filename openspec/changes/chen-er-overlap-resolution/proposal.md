# Proposal: Bounding Box Overlap Resolution

## Problem
When layout direction constraints (like `[dir: right]`) shift entire connected components, they can collide and overlap with other independent branches (e.g. the `Employee` branch in our example). This makes parts of the diagram unreadable.

## Solution
Implement a one-directional scan-line overlap resolver (`resolveOverlaps`) that:
- Iteratively scans all core nodes for bounding box intersections.
- When an intersection is detected, pushes the rightmost node further to the right by the required distance plus a margin.
- Propagates this push downstream to its connected sub-graph.

## What Changes
- **`src/layout.ts`**:
  - Add the `resolveOverlaps()` method after connection direction metadata shifts.
  - Scan for bounding box overlaps and apply `shiftSubGraph` to resolve them horizontally.
