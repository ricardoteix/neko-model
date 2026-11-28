## MODIFIED Requirements

### Requirement: Drag-and-Drop Coordinate Update
The visual editor SHALL allow the user to drag any core node or multiple selected core nodes on the canvas, updating their `pos` coordinates dynamically.

#### Scenario: Dragging Customer entity
- **WHEN** the user drags the Customer entity node to coordinate `(200, 300)`
- **THEN** the editor SHALL update the DSL representation to include `[pos: 200, 300]` for Customer.

#### Scenario: Dragging multiple selected nodes
- **WHEN** the user selects multiple nodes (e.g. Customer entity and Places relationship) and drags any one of them by an offset of `(50, 80)`
- **THEN** the editor SHALL update the coordinates of all selected nodes by `(50, 80)` in the DSL representation simultaneously.

## ADDED Requirements

### Requirement: Simultaneous Multi-Element Dragging
The visual editor SHALL preserve the selection when the user clicks down on an already-selected element without modifier keys, and SHALL move all selected elements together in real-time preserving their relative spacing.

#### Scenario: Preserving multi-selection on drag start
- **WHEN** three nodes are currently selected and the user presses mouse down on one of the selected nodes without holding Control
- **THEN** the editor SHALL keep all three nodes selected and initiate a group drag.

#### Scenario: Grid snapping with anchor node
- **WHEN** a group of nodes is dragged and grid snap is enabled (e.g. 20px)
- **THEN** the dragged node under the cursor SHALL act as the anchor snapping to the nearest 20px interval, and the resulting delta vector SHALL be applied to all other selected nodes.

#### Scenario: Updating connected edges during multi-drag
- **WHEN** two connected nodes are dragged together
- **THEN** both endpoints and the label of the connecting edge SHALL translate together by the drag delta without changing angle or length.

### Requirement: Marquee Selection Box
The visual editor SHALL provide a rectangular marquee selection box when clicking and dragging across the canvas background in Select mode.

#### Scenario: Dragging a selection box around multiple nodes
- **WHEN** the user clicks on an empty canvas area in Select mode and drags the mouse across the bounding boxes of two nodes
- **THEN** the editor SHALL render a visible selection box rectangle and add the intersecting nodes to the active selection upon mouse release.

#### Scenario: Additive selection with Shift key
- **WHEN** the user holds the Shift key while dragging a marquee selection box
- **THEN** the newly intersected nodes SHALL be added to the existing selection without clearing previously selected nodes.

### Requirement: Canvas Pan Navigation and Hand Tool
The visual editor SHALL provide a dedicated Hand tool and a Spacebar modifier shortcut for panning the viewport.

#### Scenario: Panning with Hand tool
- **WHEN** the user activates the Hand tool in the toolbox and drags anywhere on the canvas
- **THEN** the editor SHALL pan the viewport without initiating marquee selection or node dragging.

#### Scenario: Temporary pan with Spacebar
- **WHEN** the user holds down the Spacebar while in Select mode and drags the canvas
- **THEN** the editor SHALL temporarily pan the viewport, and return to Select mode when the Spacebar is released.
