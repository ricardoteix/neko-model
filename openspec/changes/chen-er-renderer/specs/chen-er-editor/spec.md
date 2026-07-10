## ADDED Requirements

### Requirement: Split-Pane Playground Interface
The standalone editor SHALL provide a split-pane web UI with a syntax-highlighted code editor on one side and a live-rendering SVG preview canvas on the other side.

#### Scenario: Split Pane Layout
- **WHEN** the user loads the playground page
- **THEN** the screen displays the code editor panel and the preview panel side-by-side on desktop, or stacked vertically on mobile

### Requirement: Real-Time Debounced Rendering
The editor SHALL automatically parse and render the diagram in real-time as the user edits the code, using a debounce timeout of 250ms to ensure smooth editing without UI freeze.

#### Scenario: Update Preview on Typing
- **WHEN** the user type new DSL statements in the editor and stops typing for 250ms
- **THEN** the preview panel updates with the newly rendered SVG diagram

### Requirement: Visual Error Reporting
The editor SHALL capture parser syntax errors and display them as inline markers or a floating overlay with line numbers and descriptive messages, while retaining the last successfully rendered diagram in the preview.

#### Scenario: Display Syntax Error
- **WHEN** the user enters an invalid DSL statement (e.g., mismatched brackets)
- **THEN** the editor shows an error notification indicating the invalid line and column, and the preview panel remains frozen on the last valid render

### Requirement: Diagram Export
The editor SHALL provide export controls to download the current diagram as a standalone SVG file, render it to a PNG image for download, or copy the DSL source code to the clipboard.

#### Scenario: Export as SVG file
- **WHEN** the user clicks the "Export SVG" button
- **THEN** the browser downloads a standalone `.svg` file containing the complete drawing and embedded styles

### Requirement: Live Theme Selection
The editor SHALL provide an interactive control to switch themes (e.g., Default, Dark, Forest, Neutral) and update the preview canvas in real-time.

#### Scenario: Switch Theme in Playground
- **WHEN** the user selects "Dark" from the theme dropdown menu
- **THEN** the rendered SVG instantly updates its CSS variables to display the dark mode colors
