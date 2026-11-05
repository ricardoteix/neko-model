## ADDED Requirements

### Requirement: Multilingual Playground Interface
The visual playground SHALL support Portuguese (PT-BR) as its default user interface language, alongside English (EN), translating all toolbar buttons, headers, tooltips, dialogs, and property panels.

#### Scenario: Defaulting to PT-BR on fresh load
- **WHEN** a user opens the playground without prior stored language preferences
- **THEN** the interface language SHALL default to `pt-br`
- **AND** all action labels (e.g. "Copiar Código", "Exportar SVG") and tools (e.g. "Entidade", "Relacionamento") SHALL be rendered in Portuguese.

#### Scenario: Switching language dynamically
- **WHEN** the user selects "English" in the header language selector
- **THEN** the UI text throughout the playground SHALL immediately re-render in English
- **AND** the preference SHALL be persisted to `localStorage` under key `neko_model_lang`.

#### Scenario: Localized default example model
- **WHEN** the editor loads initial content in PT-BR mode
- **THEN** it SHALL provide a sample Chen ER diagram using Portuguese identifiers and keywords.
