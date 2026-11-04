## Context

The Neko Model project (formerly Chen ER) is a standalone Chen ER diagram layout engine and visual web editor. The application currently requires rebranding to align with naming guidelines, along with a set of visual and interactive features to improve developer UX, including scroll zoom, custom grid snapping, multi-selection node alignment, a resizable workspace layout, and inspector panel fixes.

## Goals / Non-Goals

**Goals:**
- Perform complete rebranding to "Neko Model" across the application, metadata, and browser titles.
- Integrate the official Coral/Navy/Cream color palette and Outfit font.
- Support unquoted literal cardinality tokens (`1`, `N`, `(1,1)`, etc.) in the parser and AST serializer.
- Implement mouse scroll zoom, custom snap dropdowns, and multi-node alignment.
- Provide a resizable split-pane layout to resize panels.
- Fix specialization superclass and attribute list UI bugs.

**Non-Goals:**
- Adding database schema generation or remote storage features.
- Changing the underlying Dagre-based auto-layout engine.

## Decisions

### 1. Parser Extension for Literal Cardinalities
- **Approach**: Modify the parser in `src/parser.ts` to allow a broader set of token types after the colon (`:`) on connection statements. Instead of only matching `STRING`, we will attempt to parse:
  - An `IDENTIFIER` (for `N`, `M`, etc.).
  - A `NUMBER` (for `1`, `0`, etc.).
  - A parenthesized expression like `PAREN_OPEN NUMBER COMMA (NUMBER | IDENTIFIER) PAREN_CLOSE` to parse `(1,1)` or `(1,n)`.
- **AST Serializer**: Update `src/serializer.ts` to output unquoted cardinalities if they match the literal pattern, or write them directly based on their parsed string representation.

### 2. Multi-Select and Alignment Actions
- **Selection State**: Modify `playground/app.ts` to support a selection array/set `selectedIds` instead of a single `selectedId` variable when `Ctrl` is held during clicks.
- **Alignment Computation**: Add horizontal/vertical align buttons to the visualizer panel header. When triggered, calculate the target coordinate (e.g., matching the first selected element's X or Y) and apply it to all selected nodes in the AST, followed by `serializeAndSync()`.

### 3. Draggable Splitter Implementation
- **Layout**: Introduce a vertical splitter divider (`.splitter-handle`) between `#editor-panel` and the preview pane.
- **Dragging**: Attach event listeners for `mousedown` on the handle. On dragging, compute the pointer's percentage offset across the workspace and adjust the width styles of the editor and visualizer panels dynamically.

### 4. Specialization Superclass Empty Selection
- **Dropdown Option**: Add a blank `<option value="">-- Select Superclass --</option>` to the top of the superclass selector in `playground/app.ts`. If selected, set `superclass` to `""` in the AST, causing the serializer to omit the `superclass` property.

## Risks / Trade-offs

- **[Risk]** Panning and scroll zoom conflict -> **[Mitigation]** Restrict scroll zoom capture to when the cursor is positioned directly over the SVG canvas container element.
- **[Risk]** Flex-shrink layout issues with inputs -> **[Mitigation]** Enforce `min-width: 0` on flex items and set explicit widths on the delete button within the properties row to prevent overflow.
