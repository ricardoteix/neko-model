## 1. Project Setup & Base Architecture

- [x] 1.1 Create the directory structure for a standalone NPM package (TypeScript configuration, bundler setup).
- [x] 1.2 Install required dependencies including `dagre` (or compile a lightweight version), testing framework, and build tools.
- [x] 1.3 Create the main library entry point exposing parsing, layout, and rendering APIs.

## 2. DSL Parser Development

- [x] 2.1 Implement the Lexer/Tokenizer to scan the DSL character stream into tokens (keywords, identifiers, numbers, brackets, operators).
- [x] 2.2 Implement the Parser to build a typed Abstract Syntax Tree (AST) representing entities, relationships, attributes, connections, specializations, offsets, styles, and configurations.
- [x] 2.3 Implement detailed syntax error handling that reports exact line and column numbers.
- [x] 2.4 Write unit tests validating DSL parsing coverage (covering complex brackets, attributes nesting, and relationships).

## 3. Pluggable Layout Manager

- [x] 3.1 Create the `LayoutEngine` interface and register the layout dispatcher inside the core library.
- [x] 3.2 Implement `DagreRadialLayoutEngine` to orchestrate core node positioning (using `dagre`) followed by computing empty angular sectors to place attributes radially.
- [x] 3.3 Implement calculations to position specialized nodes (weak entities, identifying relationships, disjoint/overlapping circles).
- [x] 3.4 Implement the post-processing coordinate offset utility that translates layout-computed positions with bracket `offset` metadata.
- [x] 3.5 Create unit tests confirming that layout computations correctly separate core structures and apply offsets.

## 4. SVG Document Renderer

- [x] 4.1 Implement SVG shape templates for Chen elements: Entity (rectangle), Weak Entity (double rectangle), Relationship (diamond), Identifying Relationship (double diamond).
- [x] 4.2 Implement SVG templates for Attribute variants: Key (underlined text), Weak Key (dashed underline), Multivalued (double oval), Derived (dashed oval), Composite (nested nodes).
- [x] 4.3 Implement connection drawing supporting partial participation (single line), total participation (double line), and cardinality text labels with offset support.
- [x] 4.4 Implement built-in theme CSS variables (default, dark, forest, neutral) injected into the SVG's style block.
- [x] 4.5 Write tests to verify generated SVG structure, element classes, and responsiveness (viewBox).

## 5. Standalone Web Playground

- [x] 5.1 Develop the responsive split-pane UI HTML/CSS structure (Code panel on the left, Preview panel on the right).
- [x] 5.2 Integrate CodeMirror/Monaco editor into the code pane with basic code editing capabilities.
- [x] 5.3 Write the controller logic that debounces input changes (250ms) and updates the preview.
- [x] 5.4 Implement visual error overlays in the editor when syntax errors are thrown.
- [x] 5.5 Implement UI controls for theme switching and exports (Download SVG, Download PNG, Copy DSL).
