## ADDED Requirements

### Requirement: Open .nkm File Action
The playground SHALL provide a button to open and load `.nkm` diagram files from the local filesystem into the editor.

#### Scenario: User clicks open button
- **WHEN** user clicks the "Abrir .nkm" (or "Open .nkm") button in the header
- **THEN** a native file selection dialog opens filtered to `.nkm` and `.txt` files

#### Scenario: User selects a valid file
- **WHEN** user chooses a valid `.nkm` file
- **THEN** the file contents are loaded into the CodeMirror editor
- **THEN** the diagram is compiled and rendered on the visual canvas
- **THEN** the editor header displays the name of the opened file

#### Scenario: Drag and drop file loading
- **WHEN** user drags a `.nkm` file and drops it onto the editor panel
- **THEN** the file is loaded into the editor and compiled automatically

#### Scenario: Localization
- **WHEN** the playground language is Portuguese
- **THEN** the button displays "Abrir .nkm" with tooltip "Abrir arquivo .nkm"
- **WHEN** the playground language is English
- **THEN** the button displays "Open .nkm" with tooltip "Open .nkm file"
