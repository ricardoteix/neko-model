# Proposal: Connected Components Layout Isolation

## Problem
Currently, the diagram layout applies connection directions and overlap resolution globally across all nodes in the same coordinate space. When one component is shifted (e.g. `Customer/Order` horizontal layout), it intrudes into the space of another disjoint component (e.g. `Employee`), causing them to interleave. This results in connection lines crossing unrelated nodes and causing visual clutter.

## Solution
Isolate disjoint graphs into distinct connected components:
- Parse and identify connected components of core nodes.
- Apply connection direction layout constraints and overlap resolution locally within each component.
- Arrange the resolved components side-by-side in the final layout viewport, sorted by their original Dagre layout order.

## What Changes
- **`src/layout.ts`**:
  - Implement connected component grouping.
  - Apply `dir` constraints and `resolveOverlaps()` locally.
  - Position components side-by-side with a configurable separation spacing.
