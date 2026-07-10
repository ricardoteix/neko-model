## Why

Currently, database designers, software engineers, and database administration students do not have an automated, text-to-diagram modeling tool that renders conceptual Entity-Relationship (ER) models in Peter Chen's original 1976 notation. Existing text-based tools like Mermaid only support Crow's Foot notation, which represents physical/logical table structures. This forces teams to use heavy, manual drag-and-drop graphic editors (e.g., Draw.io, Lucidchart) for conceptual diagrams, which hampers version control and rapid iteration.

## What Changes

- **New Textual DSL**: Design a human-readable, declarative, Mermaid-like language syntax to describe Chen-style ER diagrams including entities, weak entities, attributes (key, weak key, derived, multivalued, composite), relationships, identifying relationships, and specialization/generalization hierarchies.
- **Pluggable Layout Engine**: Build a layout pipeline that defaults to a custom hybrid algorithm (Dagre for core topology + radial positioning for attribute satellites) but allows other layout engines to be swapped in via config.
- **Precision Offsets**: Add DSL support for manual coordinate offsets (`[offset: x, y]`) and label alignments to let designers fine-tune the final layout.
- **Styling and Theming**: Provide built-in color themes (e.g., Default, Dark, Forest, Neutral) and full CSS variable integration on generated SVGs for effortless styling overrides.
- **Standalone Web Editor**: Create a standalone HTML5/CSS3 live preview playground for writing, viewing, and exporting diagrams.

## Capabilities

### New Capabilities
- `chen-er-core`: The core library containing the DSL lexer/parser, the modular layout manager (with Dagre-radial and layout offset support), and the interactive SVG document renderer.
- `chen-er-editor`: A standalone, web-based sandbox/editor offering split-pane live rendering, error highlighting, SVG/PNG export, and theme selection.

### Modified Capabilities
*(None)*

## Impact

- **New Library**: A standalone JS package (`chen-er.js`) that operates client-side with no heavy backend requirements.
- **Ecosystem**: Can be packaged into CLIs, CI/CD runners, or browser extensions to convert markdown blocks on sites like GitHub into inline SVGs.
