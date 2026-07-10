## Context

The Chen Entity-Relationship (ER) model is widely taught and used for conceptual database design. However, there is currently no open-source, modern textual DSL renderer for it. Teams either design them manually using drawing canvas tools (Lucidchart, Draw.io) or use logical modeling tools (like Crow's Foot in Mermaid). This design outlines a modern, extensible JavaScript-based library and playground that compiles a custom Chen-style ER DSL into structured, interactive SVGs.

## Goals / Non-Goals

**Goals:**
- Provide a standalone, lightweight JavaScript library (`chen-er.js`) with zero runtime dependencies.
- Design a modular, pluggable layout engine interface that defaults to a custom Hybrid (Dagre-Radial) engine but allows force-directed or manual engines to be configured.
- Support detailed diagramming features: weak entities, identifying relationships, derived attributes, multivalued attributes, composite attributes, and generalization/specialization circles.
- Support inline offsets for custom fine-tuning of element layout.
- Render responsive SVGs styled via configurable CSS variables.

**Non-Goals:**
- Generating SQL schemas from the Chen ER model (the goal is strictly visual conceptual diagram rendering).
- Supporting logical/physical schema details (e.g., column data types, table foreign key constraints).
- Building an interactive drag-and-drop editor (the system uses a declarative text-to-diagram workflow).

## Decisions

### Decision 1: Parser Architecture
- **Choice**: Hand-written lexical analyzer and parser in TypeScript/JavaScript.
- **Rationale**: The grammar is declarative, line-oriented, and simple. A custom parser can be kept extremely small (<10KB), has zero runtime dependencies, and can yield highly descriptive syntax errors (with lines and columns) compared to heavy parser generators like PEG.js or Chevrotain.
- **Alternatives Considered**: Using a parser generator. While it simplifies grammar updates, it increases compilation complexity and output bundle size.

### Decision 2: Pluggable Layout Pipeline
- **Choice**: Separate layout calculation from rendering. A layout configuration dictates which engine is loaded. The default is `DagreRadialLayoutEngine`.
  - **Core Layout**: Feed Entities, Relationships, and Specialization nodes into `dagre` to calculate their macro coordinate grid.
  - **Radial Satellite Layout**: For each parent node, calculate vectors of its connected relationships/entities. Identify open angular sectors. Place attribute ovals in a ring around the parent in these open sectors.
- **Rationale**: Standard graph layout engines stretch attribute ovals far away, making ER diagrams look unreadable. Radial positioning keeps attributes clustered closely to their target node. Separating this into a modular layout interface makes it trivial to swap in a force-directed layout if requested.
- **Alternatives Considered**: Direct force-directed layouts. Often results in overlapping attributes and non-deterministic placements that make text hard to read.

### Decision 3: SVG Rendering & Styling via CSS Variables
- **Choice**: Output pure vector SVGs that inject CSS custom properties (`--chen-bg`, `--chen-entity-fill`, etc.).
- **Rationale**: SVGs scale infinitely, support clean text rendering, allow simple double-border shapes (for weak entities and multivalued attributes), and enable easy interactivity. CSS variables allow the container webpage to style or theme the diagram dynamically.
- **Alternatives Considered**: Canvas rendering. Harder to scale, lacks interactive elements, and styling cannot be modified externally.

### Decision 4: DSL Offsets
- **Choice**: Offset properties defined inside brackets (e.g. `[offset: 10, -20]`) are parsed into metadata and applied post-layout.
- **Rationale**: Post-processing coordinate projection keeps the core layout engines pure. The engine calculates the default coordinates, and the offset is added during projection before rendering (`x_final = x_layout + x_offset`).

## Risks / Trade-offs

- **[Risk] High-degree nodes causing radial attribute overlapping** → *Mitigation*: The radial engine will automatically adjust the orbit radius outward if the number of attributes exceeds the sector capacity.
- **[Risk] Complex layout calculation performance** → *Mitigation*: The default dagre-radial layout is deterministic and runs in $O(N \log N)$ time, allowing instant rendering updates. For heavy diagrams, debouncing inputs to 250ms prevents browser lag.
