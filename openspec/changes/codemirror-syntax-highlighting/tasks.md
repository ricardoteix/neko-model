## 1. Dependencies

- [x] 1.1 Install `codemirror`, `@codemirror/language`, and `@lezer/highlight` in `devDependencies`

## 2. Language Definition & Themes

- [x] 2.1 Create `playground/neko-lang.ts` with StreamLanguage token parser for EN and PT-BR DSL
- [x] 2.2 Configure syntax highlighting style tags and theme extensions (Dark & Light)

## 3. Playground Integration

- [x] 3.1 Update `playground/index.html` to mount CodeMirror container
- [x] 3.2 Update `playground/style.css` for CodeMirror layout, gutters, and scrollbars
- [x] 3.3 Update `playground/app.ts` to instantiate CodeMirror and wire bi-directional sync with canvas and undo/redo

## 4. Verification

- [x] 4.1 Run unit tests (`npm test`)
- [x] 4.2 Run playground build (`npm run build`)
