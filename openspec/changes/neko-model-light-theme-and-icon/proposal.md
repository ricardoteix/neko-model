## Why

The playground interface needs to default to a light theme as its primary visual identity for improved readability. Additionally, it must feature the official brand icon (`assets/neko-model-icon.png`) in the header area and start the live preview in light mode by default.

## What Changes

- Change the default user interface layout style in the playground from dark mode to light mode.
- Update the default selected value in the theme selector dropdown to Light/Default.
- Integrate the brand icon (`assets/neko-model-icon.png`) in the top-left section of the header.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `project-branding`: Modify layout branding requirements to mandate light mode as default and configure the header logo icon image.

## Impact

- Playground index (`playground/index.html`), style sheet (`playground/style.css`), and visual script (`playground/app.ts`).
