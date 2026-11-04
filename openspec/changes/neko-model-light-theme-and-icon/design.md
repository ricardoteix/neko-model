## Context

The Neko Model playground currently defaults to dark mode UI and starts the live preview canvas in dark mode. The header features a glowing circle orb instead of the official brand icon `assets/neko-model-icon.png`. This design outlines how to make light mode (using Warm Cream and Dark Navy) the default style for the entire workspace, integrate the branding icon in the header, and set the live preview to start in light mode.

## Goals / Non-Goals

**Goals:**
- Make Light Mode (Warm Cream background, Navy Blue text) the default theme for the playground UI.
- Bind the theme selector dropdown to update the body CSS class so the workspace UI colors change dynamically along with the SVG preview.
- Add `assets/neko-model-icon.png` in the header.
- Start the visualizer SVG render theme in light mode by default.

**Non-Goals:**
- Removing dark mode, forest green, or neutral themes (they must continue to exist as selectable options).

## Decisions

### 1. Dynamic UI Theme Classes
- **Approach**: Modify `playground/style.css` to define the default root variable tokens as the light brand theme (Warm Cream background, Dark Navy text/border colors). Move the dark mode, forest, and neutral theme variable overrides to specific body classes (e.g. `body.dark`, `body.forest`, `body.neutral`).
- **Toggling**: Update `playground/app.ts` to sync the document body's class name with the selected value of `#theme-select` on change, and apply it initially during DOM loading.

### 2. Header Brand Icon Integration
- **HTML Markup**: Replace `<span class="glowing-orb"></span>` in the `.logo-section` of `playground/index.html` with an `<img>` tag pointing to `./assets/neko-model-icon.png`.
- **CSS Styling**: Style `.brand-icon` with `height: 28px; width: auto; margin-right: 4px;` to match the layout.

### 3. Startup Select State
- **Select element**: Remove the `selected` attribute from `<option value="dark">` and place it on `<option value="default">` in the theme select dropdown.
- **Initial Preview Theme**: Ensure the default theme configuration in `playground/app.ts` resolves to `"default"` (Light) on load.

## Risks / Trade-offs

- **[Risk]** Text contrast in code editor and inputs -> **[Mitigation]** Define specific input background and text color variables (e.g. `--bg-input`, `--color-text`) that swap cleanly between light and dark body themes.
