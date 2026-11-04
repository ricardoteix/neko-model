## 1. Project Rebranding & Styling

- [x] 1.1 Update name, description, and metadata fields in `package.json` to "neko-model".
- [x] 1.2 Replace browser title and branding text tags with "Neko Model" in `playground/index.html`.
- [x] 1.3 Apply new visual theme styling, CSS custom variables, and the Outfit font in `playground/style.css`.

## 2. Core Parser & Serializer Updates (Cardinality Syntax)

- [x] 2.1 Refactor the parser in `src/parser.ts` to support unquoted numeric, identifier, and parenthesized cardinality labels.
- [x] 2.2 Update the serializer in `src/serializer.ts` to stringify cardinalities without double quotes.
- [x] 2.3 Add unit tests in `src/parser.test.ts` and `src/serializer.test.ts` to verify direct cardinality handling.

## 3. Visual Editor Interaction Improvements

- [x] 3.1 Implement mouse wheel zoom listener over the visualizer canvas without requiring the Ctrl modifier key in `playground/app.ts`.
- [x] 3.2 Add a snap pixel size dropdown selector (e.g., 5px, 10px, 20px) to `playground/index.html` and refactor the `snapVal` function in `playground/app.ts`.
- [x] 3.3 Integrate a draggable splitter handle between the editor and preview panels, adding mouse drag resize handlers.

## 4. Selection, Alignment & Properties Fixes

- [x] 4.1 Add support for multi-node selection by tracking selected IDs in a set when the `Ctrl` key is pressed in `playground/app.ts`.
- [x] 4.2 Create horizontal and vertical alignment buttons in the UI and write coordinate alignment logic to update the AST and sync DSL.
- [x] 4.3 Add an empty option placeholder for the specialization superclass dropdown in `playground/app.ts` to permit unsetting superclasses.
- [x] 4.4 Adjust properties inspector layout CSS in `playground/style.css` to prevent delete attribute buttons from overflowing the sidebar.
