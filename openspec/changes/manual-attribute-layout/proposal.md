## Why

Currently, attributes are arranged dynamically around entities and relationships based on incident edge angles and total attribute counts. In existing modes (`default`, `zigzag`, `classic`), adding new attributes or connecting new relationships causes the layout engine to recalculate orbital angles for all attributes, causing already-positioned attributes to "jump" unexpectedly. Users need a **Manual** attribute spacing mode that becomes the new default: newly added attributes are dynamically placed into the best open gap initially and then immediately frozen as a relative `[offset: dx, dy]` (relative to parent center) or `[pos: X, Y]` (absolute coordinates), remaining perfectly stable from then on.

## What Changes

- **New `manual` Attribute Layout Mode (Default)**:
  - Add `manual` to `attribute_layout` (and PT `layout_atributos manual`), making it the default spacing mode.
  - In `manual` mode, attributes with `[offset: dx, dy]` are placed directly at `(parent.x + dx, parent.y + dy)`, completely independent of other attributes, total counts, or incident edge angles.
  - In `manual` mode, attributes with `[pos: X, Y]` are placed at absolute canvas coordinates `(X, Y)`.
- **Dynamic-to-Manual Creation Workflow**:
  - When an attribute is added without coordinates (e.g. via UI "+ Atributo" button or newly typed in DSL), the layout engine calculates a smart initial gap placement dynamically and immediately converts/freezes it into a fixed relative `[offset: dx, dy]` in the AST and DSL.
  - Moving the parent entity/relationship automatically moves all its relative `offset` attributes in lockstep.
- **Support for Both Relative and Absolute Syntax**:
  - `[offset: dx, dy]` represents a vector relative to the parent element's center.
  - `[pos: X, Y]` represents an absolute position on the canvas.
  - Both parser and serializer are updated to support `pos` on attributes.
- **Preserve Existing Layout Modes**:
  - Users can still explicitly select `dynamic` (`default`), `zigzag`, or `classic` from the header dropdown if full automatic recalculation is desired.

## Capabilities

### Modified Capabilities
- `chen-er-core`: Add `manual` attribute layout mode where `offset` is evaluated directly from parent center and `pos` is evaluated as absolute coordinate.
- `pos-metadata`: Support `pos` coordinate metadata on attributes in parser, AST, and serializer.
- `visual-creator`: Update playground attribute layout dropdown to include "Manual (Default)" and implement dynamic-to-manual freezing when attributes are added or moved.

## Impact

- `src/types.ts`: Update `attribute_layout` type definition to include `"manual"`, and add `pos?: { x: number; y: number } | null` to `Attribute`.
- `src/parser.ts`: Allow `pos` bracket metadata on attribute declarations.
- `src/serializer.ts`: Output `pos` for attributes if specified, alongside `offset`.
- `src/layout.ts`: Implement `manual` attribute layout calculation (direct parent center + offset, or absolute pos).
- `playground/app.ts`, `playground/i18n.ts`, `playground/index.html`: Update default spacing to Manual, freeze initial positions on attribute addition, and update translations.
