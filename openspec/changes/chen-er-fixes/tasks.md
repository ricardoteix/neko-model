## 1. Core Layout Updates

- [x] 1.1 Implement concentric layering of attributes in `placeAttributes` (max 3 attributes per orbit layer per sector) in `src/layout.ts`.
- [x] 1.2 Recalibrate edge start/end points using final node coordinates after offsets are applied in `src/layout.ts`.
- [x] 1.3 Update layout unit tests to verify concentric layering math and offset connection lines.
- [x] 1.4 Calculate dynamic attribute oval widths in `src/layout.ts` based on text length.
- [x] 1.5 Reverse subclass specialization edges direction in `src/layout.ts` (draw from subclass to specialization node).

## 2. SVG Rendering & Styling Refinements

- [x] 2.1 Update `src/renderer.ts` to draw specializations as triangles using an SVG polygon and render shorthand constraints like `(t, d)`.
- [x] 2.2 Define `--chen-attribute-key-fill` theme variables and style rules inside `THEMES` and `BASE_STYLES` in `src/renderer.ts`.
- [x] 2.3 Update key attribute rendering in `src/renderer.ts` to draw ovals with the key fill class and remove underline decorations.
- [x] 2.4 Update renderer unit tests to check for specialization triangles and key fill styling classes.
- [x] 2.6 Add SVG `<defs>` and `<marker id="chen-arrow">` arrowhead block in `src/renderer.ts`.
- [x] 2.7 Apply marker-end attribute on lines targeting specialization nodes in `src/renderer.ts`.
- [x] 2.8 Update unit tests to verify dynamic width sizing and subclass arrow markers.
- [x] 2.9 Run builds and tests to verify compile checks and visual playground rendering.
