## Why

Currently, the Chen ER project only supports textual creation of ER diagrams via the `chenER` DSL, with a simple read-only SVG visualization in the playground. Users want to construct and edit diagrams visually through an interactive designer, dragging-and-dropping elements and drawing connections, while automatically generating the corresponding `chenER` DSL (and preserving absolute positions) for portability and sharing.

## What Changes

- **DSL Extension**: Add bracket-syntax metadata `[pos: X, Y]` to entity, weak_entity, relationship, identifying_relationship, and specialization declarations to specify manual coordinate overrides.
- **Parser & AST Support**: Extend the parser to extract and represent node positions (`pos`) in the AST.
- **Bi-directional Generator (`stringifyAST`)**: Add a serializer that converts the AST back to clean `chenER` DSL, including `[pos: X, Y]` metadata.
- **Layout engine updates**: Modify the layout manager to respect absolute coordinate overrides and bypass Dagre auto-layout for positioned nodes.
- **Playground Upgrade**: Redesign the playground web UI to include a drag-and-drop toolbox on the left, an interactive SVG canvas in the center, and a properties inspector panel on the right.

## Capabilities

### New Capabilities
- `visual-creator`: Full interactive visual editor with drag-and-drop toolbox, mouse connections, properties inspector, and bidirectional DSL synchronization.
- `pos-metadata`: AST representation, parser parsing, layout engine integration, and stringification support for `[pos: X, Y]` coordinates.

### Modified Capabilities
- `chen-er-core`: Update the core layout rendering spec to support manual coordinate overrides.

## Impact

- `src/types.ts`: AST changes to include `pos` overrides.
- `src/parser.ts`: Bracket parser additions for declarations.
- `src/layout.ts`: Layout logic coordinates overrides.
- `src/index.ts`: Expose `stringifyAST` and helper modules.
- `playground/*`: Completely redesigned front-end UI and event handlers.
