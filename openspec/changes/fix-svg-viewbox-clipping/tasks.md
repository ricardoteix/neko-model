## 1. Types & Layout Engine Updates

- [x] 1.1 Update `PositionedGraph` interface in `src/types.ts` to include optional `minX?: number` and `minY?: number`.
- [x] 1.2 Update `DagreRadialLayoutEngine` in `src/layout.ts` to calculate accurate `minX`, `minY`, `width`, and `height` covering negative coordinate extents with padding when manual positions are present.

## 2. Renderer & ViewBox Updates

- [x] 2.1 Update `<svg ... viewBox="...">` generation in `src/renderer.ts` to use `viewBox="${graph.minX ?? 0} ${graph.minY ?? 0} ${graph.width} ${graph.height}"`.
- [x] 2.2 Add unit tests in `src/layout.test.ts` and `src/renderer.test.ts` asserting negative coordinate handling and non-zero viewBox output.

## 3. Verification & Build

- [x] 3.1 Run `npm test` and `npm run build` to verify all test suites pass and production builds succeed.
