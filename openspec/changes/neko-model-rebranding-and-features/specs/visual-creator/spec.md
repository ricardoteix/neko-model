## ADDED Requirements

### Requirement: Mouse Wheel Zooming
The visual editor canvas SHALL support zooming in and out using the mouse scroll wheel directly, modifying the viewport scaling transformation.

#### Scenario: Scrolling mouse wheel to zoom
- **WHEN** the user scrolls the mouse wheel over the canvas container
- **THEN** the preview canvas zoom level is updated relative to scroll direction (scroll up increases zoom, scroll down decreases zoom) without requiring any modifier key.

### Requirement: Configurable Grid Snapping
The visual editor SHALL support snapping coordinates of dragged nodes to a configurable grid size specified via a dropdown selector (e.g., 5px, 10px, 20px) in the interface.

#### Scenario: Changing snap spacing
- **WHEN** the user selects a snap value (e.g. 10px) from the dropdown and drags a node
- **THEN** the canvas visual grid alignment guides update to 10px intervals, and the dragged node's coordinates are snapped to increments of 10px during movement.

### Requirement: Multi-Select and Node Alignment
The visual editor SHALL support selecting multiple entities or relationships using the CONTROL key and aligning their positions horizontally or vertically through toolbar buttons.

#### Scenario: Aligning selected nodes
- **WHEN** the user holds the CONTROL key, clicks on three different entity nodes, and clicks "Align Horizontally"
- **THEN** the layout engine sets the Y-coordinates of all selected elements to match the Y-coordinate of the first selected element, updating the DSL.

### Requirement: Specialization Superclass Selector
The properties inspector for specialization nodes SHALL NOT enforce or default to a pre-selected superclass, allowing it to remain empty.

#### Scenario: Creating a specialization without a superclass
- **WHEN** a user creates a new specialization node visually
- **THEN** the superclass dropdown in the inspector defaults to an empty placeholder, and the serialized DSL does not output a `superclass` property.

### Requirement: Attribute Deletion Layout
The properties inspector layout SHALL ensure that the delete attribute button (`✕`) is completely visible and accessible inside the sidebar container at all times.

#### Scenario: Viewing attributes in inspector panel
- **WHEN** an entity with long attribute names is selected
- **THEN** the text input shrinks appropriately using flexbox properties, ensuring the delete button remains fully visible inside the inspector width bounds.

### Requirement: Resizable Workspace Splitter
The editor layout SHALL include a draggable splitter handle between the DSL code editor panel and the preview visualizer panel to customize their sizes.

#### Scenario: Resizing panels
- **WHEN** the user clicks and drags the splitter handle horizontally
- **THEN** the width of the code editor panel and preview visualizer panel are resized proportionally, adjusting the SVG render viewport coordinates.
