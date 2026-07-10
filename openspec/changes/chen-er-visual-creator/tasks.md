## 1. AST, Parser & Serializer Extensions

- [ ] 1.1 Add optional `pos` property to Entity, Relationship, and Specialization nodes in `src/types.ts`.
- [ ] 1.2 Update `src/parser.ts` to parse `[pos: X, Y]` brackets after declarations.
- [ ] 1.3 Implement the `stringifyAST` serializer function to convert an AST back to `chenER` DSL.

## 2. Layout & Rendering Updates

- [ ] 2.1 Update `src/layout.ts` to bypass Dagre layout coordinates if `pos` metadata overrides are present.
- [ ] 2.2 Add interactive SVG group classes, `data-node-id` attributes, and connection port handles to the SVG renderer in `src/renderer.ts`.

## 3. Playground Web UI Redesign

- [ ] 3.1 Design a left panel toolbox to insert Entity, Relationship, and Specialization nodes onto the canvas.
- [ ] 3.2 Implement SVG mouse drag-and-drop events to translate node coordinates, updating the DSL on release.
- [ ] 3.3 Implement port handle dragging to draw connection lines between nodes.
- [ ] 3.4 Build a right panel Properties Inspector to customize node names, keys, composite sub-attributes, and specialization disjunction/participation types.

## 4. Testing & Validation

- [ ] 4.1 Add parser unit tests for `[pos: X, Y]` metadata in `src/parser.test.ts`.
- [ ] 4.2 Add layout tests verifying coordinate overrides in `src/layout.test.ts`.
- [ ] 4.3 Conduct visual playground tests to verify drag-and-drop and bidirectional editing.
