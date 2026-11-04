## 1. HTML & Header Updates

- [x] 1.1 Replace the glowing orb span with an `img` loading `assets/neko-model-icon.png` in `playground/index.html`.
- [x] 1.2 Change the selected attribute of `#theme-select` to default to `default` (Light) instead of `dark` in `playground/index.html`.

## 2. CSS Stylesheets Re-organization

- [x] 2.1 Set the default `:root` variables in `playground/style.css` to represent the light theme (Warm Cream background, Dark Navy text and borders).
- [x] 2.2 Define class-based variable overrides (`body.dark`, `body.forest`, `body.neutral`) in `playground/style.css` to support switching UI themes dynamically.
- [x] 2.3 Add styling rules for `.brand-icon` in `playground/style.css` (height: 28px, margin-right, etc.).

## 3. JavaScript Theme Synchronization

- [x] 3.1 Update the theme selection listener in `playground/app.ts` to update the document body class list when the theme is changed.
- [x] 3.2 Initialize the document body class list with the default selected theme value on page load in `playground/app.ts`.
