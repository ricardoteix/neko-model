# project-branding Specification

## Purpose
Estabilizar a identidade visual, paleta de cores e nomenclatura da aplicação "Neko Model".

## Requirements
### Requirement: Project Rebranding
The application name across the source code configuration (`package.json`), documentation, and the web interface header/meta titles SHALL be updated to "Neko Model".

#### Scenario: Checking project branding name
- **WHEN** inspecting the `package.json` name field or the playground header title
- **THEN** it reads `"name": "neko-model"` and `<h1>Neko Model <span class="badge">Playground</span></h1>` respectively.

### Requirement: Neko Model Theme and Style Guidelines
The application's default visual theme and rendered SVG colors SHALL adopt the color palette and typography from the Neko Model brand:
- Font family: Outfit (sans-serif)
- Primary Accent: Coral Orange/Red (`#FF5A43` / `#FF6B57`)
- Dark Contrast: Navy Blue (`#0F1E36` / `#1A2238`)
- Background Light: Warm Cream (`#FCFBF7`)

#### Scenario: Selecting the default theme
- **WHEN** the application is loaded
- **THEN** the color theme uses the Neko Model brand colors, applying the Coral Orange as the primary glow and selection color.
