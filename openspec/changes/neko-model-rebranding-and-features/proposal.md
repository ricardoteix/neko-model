## Why

The project needs to be rebranded to "Neko Model" to align with new branding guidelines. Additionally, several bugs and features must be addressed in the diagram layout engine and visual playground to improve user experience, including mouse scroll zoom, custom grid snapping, multi-selection alignment tools, properties panel layout stability, and resizable workspace panels.

## What Changes

- Rebrand the project to "Neko Model" in the UI header, browser titles, and `package.json`.
- Implement a new default visual theme matching the brand logo colors (Coral Red, Navy Blue, Warm Cream) and Outfit typography.
- Support direct (unquoted) cardinality notation in the DSL (e.g., `1`, `N`, `(1,1)`, `(1,n)`).
- Replace the bin-style snap checkbox with a configurable pixel snap dropdown.
- Enable multi-node selection using the `Ctrl` key and add alignment tools (horizontal and vertical).
- Allow specialization nodes to have no default superclass.
- Prevent the delete attribute button in the properties inspector from overflowing off-screen.
- Add a draggable split-pane to adjust sizes of the DSL editor and Live Preview areas.

## Capabilities

### New Capabilities
- `project-branding`: Covers application renaming, brand theme integration, and visual guidelines.

### Modified Capabilities
- `chen-er-core`: Support direct unquoted cardinality syntax in parsing and serialization.
- `visual-creator`: Visual editor improvements including zoom, configurable snap, multi-select align, specialization defaults, layout fixes, and split panel resizing.

## Impact

- Core parser (`src/parser.ts`) and serializer (`src/serializer.ts`).
- Playground index (`playground/index.html`), stylesheet (`playground/style.css`), and visual script (`playground/app.ts`).
- Package configuration (`package.json`).
