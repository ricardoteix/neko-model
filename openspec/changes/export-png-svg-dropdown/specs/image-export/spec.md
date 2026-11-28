## ADDED Requirements

### Requirement: Unified Image Export Dropdown
The playground SHALL provide a single dropdown control for exporting the diagram as an image, offering options to export as SVG or PNG.

#### Scenario: User opens export dropdown
- **WHEN** user views the playground header
- **THEN** an "Export Image" dropdown control is visible replacing the standalone SVG button

#### Scenario: Exporting diagram as SVG
- **WHEN** user selects the "Export SVG" option from the dropdown
- **THEN** the system downloads the diagram as a `.svg` vector file

#### Scenario: Exporting diagram as PNG
- **WHEN** user selects the "Export PNG" option from the dropdown
- **THEN** the system renders the SVG onto an HTML5 canvas at high resolution (2x) and downloads the diagram as a `.png` raster image

#### Scenario: Localization
- **WHEN** the language is set to Portuguese
- **THEN** the dropdown displays "Exportar Imagem", "Exportar SVG", and "Exportar PNG"
- **WHEN** the language is set to English
- **THEN** the dropdown displays "Export Image", "Export SVG", and "Export PNG"
