## 1. Toolbox & Canvas Navigation

- [x] 1.1 Add "Hand / Pan" tool button to the toolbox HTML and update i18n translations for tool buttons
- [x] 1.2 Add CSS styles for marquee selection rectangle (`.selection-marquee`) and pan grab cursors
- [x] 1.3 Implement keyboard listeners for Spacebar to enable temporary pan navigation in Select mode

## 2. Multi-Element Dragging & Translation

- [x] 2.1 Update node mousedown logic to preserve existing multi-selection when clicking on an already-selected element
- [x] 2.2 Create multi-node drag snapshot storing initial coordinates for all selected nodes and categorizing internal vs external edges
- [x] 2.3 Update mousemove handler to translate all selected SVG node groups and reposition internal/external connected lines and labels in real-time
- [x] 2.4 Update mouseup handler to apply delta coordinates to all selected nodes in AST and serialize cleanly into the DSL with atomic undo/redo

## 3. Marquee (Box) Selection

- [x] 3.1 Implement canvas mousedown, mousemove, and mouseup to render SVG marquee selection rectangle in Select mode
- [x] 3.2 Compute node bounding boxes in SVG coordinate space and detect intersections with the marquee rectangle
- [x] 3.3 Implement Shift-key modifier to union newly intersected nodes into existing active selections

## 4. Verification & Testing

- [x] 4.1 Test multi-element drag with grid snap (preserving relative distances between nodes)
- [x] 4.2 Test internal edges (both nodes moving together) and external edges (one node moving)
- [x] 4.3 Test marquee box selection with and without Shift key
- [x] 4.4 Run test suite and playground build to ensure zero regressions
