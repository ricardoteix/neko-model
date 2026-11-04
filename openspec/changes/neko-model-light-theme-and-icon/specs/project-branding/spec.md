## MODIFIED Requirements

### Requirement: Neko Model Theme and Style Guidelines
The application's default visual theme and rendered SVG colors SHALL adopt the color palette and typography from the Neko Model brand, using the light theme as the default primary interface style:
- Default layout: Light Mode with Warm Cream (`#FCFBF7`) background for panels and editor.
- Logo icon: Display `assets/neko-model-icon.png` in the header logo section.
- Default SVG Preview Theme: The default rendered SVG theme SHALL be the light theme.
- Typography: Outfit (sans-serif)
- Accent colors: Coral Orange (`#FF5A43` / `#FF6B57`)

#### Scenario: Selecting the default theme
- **WHEN** the application is loaded
- **THEN** the interface adopts the light mode with the Neko Model icon displayed, the theme selection selector defaults to "default" (Light), and the SVG preview canvas renders in light mode.
