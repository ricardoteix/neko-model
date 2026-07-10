## 1. DSL Grammar & Parsing

- [x] 1.1 Support `attribute_layout` config directive in parser.ts.
- [x] 1.2 Add parsing unit tests for `attribute_layout` configs in parser.test.ts.

## 2. Layout & Spacing Engine

- [x] 2.1 Implement circle-distribution spacing in `layout.ts` for $2\pi$ gaps.
- [x] 2.2 Implement dynamic capacity layer chunking in `layout.ts` based on sector size.
- [x] 2.3 Implement zigzag alternating radii offset in `layout.ts` when `zigzag` is configured.
- [x] 2.4 Add layout unit tests for the spacing modes in `layout.test.ts`.

## 3. Web Playground & Build

- [x] 3.1 Update the playground app.ts to pass the parsed spacing configuration.
- [x] 3.2 Run builds and unit tests to verify compile checks and visual rendering.
