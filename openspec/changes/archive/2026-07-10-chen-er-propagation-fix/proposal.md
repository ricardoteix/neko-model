# Proposal: Shift Propagation directed flow

## Problem
In the previous overlap resolver implementation, `shiftSubGraph` traversed the layout graph as an undirected graph. This caused a child node's push to propagate backward to its parents and ancestors (upstream), dragging them along to the right. This resulted in a huge empty space on the left and caused infinite push loops that sent coordinates into the thousands when multiple constraints were applied (e.g. double horizontal layout).

## Solution
1. **Downstream-Only Propagation**: Update `shiftSubGraph` to only follow edges in the forward direction (`edge.from === currId`). This ensures shifts only propagate downstream along the layout hierarchy, stretching connection lines naturally and preventing upstream drag.
2. **Align Specialization Edges**: Update the subclass connection definition in `edges.push` from `from: sub, to: spec.id` to `from: spec.id, to: sub` to align with the downstream hierarchical flow.

## What Changes
- **`src/layout.ts`**:
  - Update `shiftSubGraph` neighbor loop to only traverse forward edges.
  - Reorder specialization subclass edge registration to flow from circle to subclass.
