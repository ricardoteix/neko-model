# Proposal: Specialization Node Padding Refinement

## Problem
The specialization triangle (e.g. for `EmployeeType`) is currently too small ($50 \times 50$ pixels). The text labels inside it (e.g. `(t, d)` or `(p, d)`) are cramped or overflow the borders.

## Solution
Add $15\text{px}$ of padding on all sides of the specialization node, increasing its size from $50 \times 50$ to $80 \times 80$ pixels. 
- Adjust text visual centering to match the larger triangle's centroid.
- Update connection arrow marker positioning to align cleanly with the enlarged triangle borders.

## What Changes
- **`src/layout.ts`**: Set specialization node width and height to $80\text{px}$ in the Dagre graph and output node map.
- **`src/renderer.ts`**: Update the specialization text coordinate to `y + 12` and the `refX` attribute of `#chen-arrow` to `42`.
