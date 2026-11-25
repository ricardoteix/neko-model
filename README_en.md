# Chen ER - Conceptual Diagram Playground

A parser, renderer, and bidirectional visual editor for Entity-Relationship (ER) diagrams based on Peter Chen's notation. This project features a robust domain-specific language (DSL) called **`chenER`** to define diagrams as code, coupled with an interactive visual interface to drag, connect, and edit elements with automatic source code synchronization.

# Playground

Access [here https://ricardoteix.github.io/neko-model/](https://ricardoteix.github.io/neko-model/)

---

## 🚀 Key Features

- **`chenER` DSL**: Simple and expressive declarative language to define entities, relationships, attributes, specializations, and connections.
- **Bidirectional Visual Editor**: Drag elements on the canvas, draw new connections, and edit properties in real-time with instant bidirectional code synchronization.
- **Precise Positioning**: Support for manual coordinate metadata (`[pos: X, Y]`) to pin nodes to the canvas and preserve custom layouts.
- **Relative Connection Directions**: Fine-grained layout control using direction cues (`[dir: left|right|up|down]`) to adjust the relative placement of connected nodes.
- **Attribute Customization**: Support for primary key, partial key (weak), multivalued, derived, and composite attributes, with classic, zigzag, or manual offset layout options (`[offset: dx, dy]`).
- **Hybrid Layout Engine (Dagre + Force)**: Smart automatic layout that respects both graph hierarchy rules and user-defined manual placements.
- **Interactive Workspace Capabilities**:
  - Zoom and pan via control buttons or mouse wheel (Ctrl + Wheel).
  - Snap-to-grid alignment.
  - Context-sensitive properties inspector panel.
  - Undo/Redo history tracking for visual edits.
  - Direct export of diagrams as production-ready SVG files.

---

## 🛠️ How to Run the Project

### Prerequisites
- Node.js (version 18 or higher recommended to run the Vitest test suite)
- npm or equivalent package manager

### Installing Dependencies
```bash
npm install
```

### Running the Development Environment
Starts the Vite development server with hot-reload for the interactive playground:
```bash
npm run dev
```

### Building for Production
Compiles the core library and the playground application for distribution:
```bash
npm run build
```

### Running Tests
Runs the unit tests using Vitest:
```bash
npm test
```

---

## 📝 The `chenER` DSL Documentation

All `chenER` source files must start with the mandatory header `chenER`. Below are the syntax details to structure your conceptual diagram.

### 1. Header and Global Configurations
At the top of your file, you can specify global styling and layout configs:
```chenER
chenER
theme dark                   %% Options: default (light), dark (dark), forest (green), neutral (B&W)
layout default               %% Options: default, force
attribute_layout default     %% Options: default (dynamic), zigzag (alternating), classic (legacy)
```

---

### 2. Entities (`entity` and `weak_entity`)
Entities represent real-world objects. Weak entities (`weak_entity`) depend on another entity to be uniquely identified.

**Syntax:**
```chenER
entity EntityName [pos: X, Y, fill: "color", stroke: "color", text: "color", strokeWidth: N] {
  regular_attribute
  key_attribute key
}

weak_entity WeakEntityName [pos: X, Y] {
  partial_key_attribute weak_key
}
```

*Note: The attributes block `{ ... }` and the style properties inside brackets `[...]` are optional.*

---

### 3. Attributes and Modifiers
Attributes are listed inside the curly braces of entities or relationships.

- **Regular Attribute**: Just the identifier name.
  `name`
- **Primary Key (`key`)**: Unique identifier (rendered underlined).
  `id key`
- **Partial Key (`weak_key`)**: Partial identifier of weak entities (rendered with a dashed underline).
  `number weak_key`
- **Multivalued (`multivalued`)**: Attributes that hold multiple values (rendered with double ellipses).
  `phones multivalued`
- **Derived (`derived`)**: Computed/calculated attributes (rendered with a dashed boundary ellipse).
  `age derived`
- **Composite (`composite`)**: An attribute made of sub-attributes (rendered hierarchically).
  `address composite(street, city, zip)`
- **Manual Offset and Style**: You can pass relative coordinates and custom colors to override positioning:
  `phones multivalued [offset: 0, 15, fill: "blue"]`

---

### 4. Relationships (`relationship` and `identifying_relationship`)
Describe associations between entities. Identifying relationships (`identifying_relationship`) link weak entities to their identifying owners.

**Syntax:**
```chenER
relationship RelationshipName [pos: X, Y] {
  relationship_attribute
}

identifying_relationship IdentifyingRelationshipName [pos: X, Y]
```

---

### 5. Specializations (`specialization`)
Represent inheritance / categorization hierarchies from a superclass to subclasses.

**Syntax:**
```chenER
specialization SpecializationName [pos: X, Y] {
  type: disjoint             %% Options: disjoint (d) or overlapping (o)
  participation: partial     %% Options: partial (single line) or total (double line)
  superclass: SuperclassName
  subclasses: Subclass1, Subclass2
}
```

---

### 6. Connections and Cardinalities
Connections link entities, relationships, and specializations together.

**Connectivity Operators:**
- `--` : Partial Participation (single line)
- `==` : Total Participation (double line)

**Full Syntax:**
```chenER
Source -- Target : "cardinality_or_role" [dir: DIRECTION, label_offset: dx, dy, stroke: "color", strokeWidth: N]
```

- **Labels (`: "text"`)**:
  - If the text consists solely of numbers/cardinality markers (e.g., `"1"`, `"N"`, `"M"`, `"(0,1)"`), it renders as a **cardinality label**.
  - Otherwise, it is treated as a **role name** describing the relationship context.
- **Label Offset (`label_offset`)**: Shifts the label position `(dx, dy)` relative to the connection line.

---

## 🎯 Layout Engine and Specific Positioning Details

The **Chen ER** layout engine blends automatic graph layouts with manual overrides.

### 📍 Absolute Positioning via `pos`
By attaching the `[pos: X, Y]` metadata property to any core node (entities, relationships, or specializations), you override the automatic layout for that node.
- **How it works**: The layout engine reads the coordinate `(X, Y)` and places the center of the node exactly at those coordinates on the canvas.
- **Editor Sync**: When you drag a node in the visual interface, the editor automatically updates the `[pos: X, Y]` coordinates in the source code. Nodes without `pos` continue to use Dagre's automatic layout.
- **Example**:
  ```chenER
  entity Customer [pos: 150, 300]
  ```

### 🧭 Relative Positioning via `dir`
On connections (`--` or `==`), you can define the direction in which the target node should be positioned relative to the source node.
- **Syntax**: `[dir: left|right|up|down]`
- **How it works**:
  - `right`: Places the target node to the right of the source node.
  - `left`: Places it to the left.
  - `down`: Places it below.
  - `up`: Places it above.
- **Layout Propagation**: When a relative direction is enforced, the layout engine shifts the target node and cascades this offset to all connected downstream descendants and subgraphs. This maintains cohesive structure and alignment.
- **Example**:
  ```chenER
  Customer -- Places [dir: right]
  ```

### 🌀 Attribute Layout (`offset`)
By default, attributes are placed in a radial or alternating pattern around their parent element.
- If you need to manually move an attribute to prevent overlapping, you can use the relative offset property: `[offset: dx, dy]`.
- **Example**:
  ```chenER
  entity Product {
    name [offset: -20, -10]
  }
  ```

---

## 🎨 Themes and Appearance

You can customize individual node styles (using `fill`, `stroke`, `text`, and `strokeWidth`) or use one of the built-in global themes:
- **`default`**: A clean, light theme with soft boundaries and high readability.
- **`dark`**: An elegant dark mode with glowing highlights, graphite cards, and neon cyan accents.
- **`forest`**: An organic theme using deep greens, earth tones, and sage accents.
- **`neutral`**: A high-contrast, black-and-white minimalist look suitable for formal documentation.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
