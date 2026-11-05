## ADDED Requirements

### Requirement: Export Diagram Code as NKM File
The visual playground SHALL allow users to export and download the current diagram DSL code as a local `.nkm` file.

#### Scenario: User clicks Export .nkm button
- **WHEN** the user clicks the "Export .nkm" button in the playground header
- **THEN** the application SHALL generate a text file containing the current content of the DSL code editor
- **AND** the browser SHALL trigger a download of the file named `model.nkm` with the `.nkm` extension.
