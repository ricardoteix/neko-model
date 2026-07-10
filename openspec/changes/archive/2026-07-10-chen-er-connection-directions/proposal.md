# Proposal: Connection Layout Directions

## Problem
Currently, the diagram layout is determined globally by Dagre (which defaults to a vertical top-to-bottom flow). This forces relationships and their connected entities downward, preventing side-by-side (horizontal) placements and making it difficult to control the visual structure of more complex diagrams.

## Solution
Introduce connection-level layout direction metadata (e.g. `[dir: right]`, `[dir: left]`, `[dir: up]`, `[dir: down]`) which allows users to explicitly declare how a target node should be positioned relative to a source node.

## What Changes
- **`src/types.ts`**: Add an optional `dir` property (`"left" | "right" | "up" | "down" | null`) to the `Connection` AST interface.
- **`src/parser.ts`**: Parse the `dir` property inside `parseBracketMetadata` and bind it to connections.
- **`src/layout.ts`**: Implement a post-Dagre layout constraint processor that shifts target nodes and their connected components using a BFS shifter (`shiftSubGraph`) to satisfy directional constraints.
